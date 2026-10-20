-- Atomic business operations. Callable only by the backend (service_role).

-- Existing promotion rules: CP -> PP with 2 active direct referrals;
-- PP -> MG with 2 active Project Partners (or above) anywhere in the referral team.
create or replace function run_promotions() returns integer
language plpgsql security definer set search_path = public as $$
declare
  n integer := 0;
  r record;
begin
  loop
    select p.id, p.role into r from partners p
    where p.status = 'Active' and (
      (p.role = 'CP' and (select count(*) from partners c where c.referred_by = p.id and c.status = 'Active') >= 2)
      or
      (p.role = 'PP' and (
        with recursive d(id) as (
          select id from partners where referred_by = p.id
          union all
          select c.id from partners c join d on c.referred_by = d.id
        ) select count(*) from partners x join d on d.id = x.id where x.role <> 'CP' and x.status = 'Active') >= 2)
    )
    order by p.joined_at limit 1
    for update;
    exit when not found;
    update partners set role = case r.role when 'CP' then 'PP' else 'MG' end where id = r.id;
    insert into partner_role_history(partner_id, from_role, to_role, reason, celebration_shown)
      values (r.id, r.role, case r.role when 'CP' then 'PP' else 'MG' end, 'auto_promotion', false);
    n := n + 1;
  end loop;
  return n;
end $$;

-- Admin approves / rejects a submitted payment. Locks the booking row so two reviews cannot
-- push verified collections past the approved price.
create or replace function review_payment(p_payment uuid, p_decision text, p_admin uuid, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  pay payments%rowtype;
  bk bookings%rowtype;
  verified numeric;
  admin_label text;
begin
  if p_decision not in ('Verified','Rejected') then raise exception 'invalid_decision'; end if;
  select * into pay from payments where id = p_payment;
  if not found then raise exception 'payment_not_found'; end if;
  select * into bk from bookings where id = pay.booking_id for update;
  select * into pay from payments where id = p_payment for update;
  if pay.status <> 'Pending Verification' then raise exception 'already_reviewed'; end if;
  if p_decision = 'Verified' then
    if bk.status = 'Cancelled' then raise exception 'booking_cancelled'; end if;
    select coalesce(sum(amount), 0) into verified from payments where booking_id = bk.id and status = 'Verified';
    if verified + pay.amount > bk.approved_price then raise exception 'exceeds_price'; end if;
  end if;
  update payments set status = p_decision, reviewed_at = now(), reviewed_by = p_admin, review_note = p_note where id = pay.id;
  select email::text into admin_label from admin_users where id = p_admin;
  insert into audit_logs(actor_type, actor_id, actor_label, action, entity_type, entity_id, before_value, after_value, reason)
    values ('admin', p_admin::text, admin_label,
            case when p_decision = 'Verified' then 'payment.verified' else 'payment.rejected' end,
            'payment', pay.id::text,
            jsonb_build_object('status', pay.status, 'amount', pay.amount, 'booking', bk.ref),
            jsonb_build_object('status', p_decision), p_note);
  return jsonb_build_object('ok', true);
end $$;

-- Create a plot booking: reserves the plot, creates/links the customer, optionally records the
-- advance as Pending Verification and converts the originating site visit. One transaction.
create or replace function create_booking(
  p_partner text, p_visit uuid, p_name text, p_mobile text, p_email text, p_address text,
  p_project uuid, p_plot text, p_area numeric, p_rate numeric, p_final numeric, p_date date,
  p_adv_amount numeric, p_adv_date date, p_adv_method text, p_adv_txn text, p_adv_receipt text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v site_visits%rowtype;
  plot_row plots%rowtype;
  cust customers%rowtype;
  calc numeric;
  disc text;
  approved numeric;
  bk_id uuid;
  pay_id uuid;
  attributed text := p_partner;
begin
  if p_visit is not null then
    select * into v from site_visits where id = p_visit for update;
    if not found or v.partner_id <> p_partner then raise exception 'visit_not_yours'; end if;
    if v.status = 'Converted to Booking' or v.booking_id is not null then raise exception 'visit_converted'; end if;
    if v.status = 'Cancelled' then raise exception 'visit_cancelled'; end if;
    p_name := v.customer_name; p_mobile := v.mobile; p_email := v.email; p_project := v.project_id;
  end if;
  calc := round(p_area * p_rate);
  if p_final < calc then disc := 'Pending Admin Approval'; approved := calc;
  else disc := 'Not Required'; approved := p_final; end if;
  if p_adv_amount is not null and p_adv_amount > approved then raise exception 'exceeds_price'; end if;

  insert into plots(project_id, plot_number, area_guntha, status)
    values (p_project, btrim(p_plot), p_area, 'Available')
    on conflict (project_id, lower(plot_number)) do nothing;
  select * into plot_row from plots where project_id = p_project and lower(plot_number) = lower(btrim(p_plot)) for update;
  if exists (select 1 from bookings where plot_id = plot_row.id and status <> 'Cancelled') then
    raise exception 'plot_taken';
  end if;

  insert into customers(full_name, mobile, email, address, source_partner_id)
    values (btrim(p_name), p_mobile, nullif(btrim(coalesce(p_email,'')),''), nullif(btrim(coalesce(p_address,'')),''), attributed)
    on conflict (mobile) do update set
      email = coalesce(customers.email, excluded.email),
      address = coalesce(excluded.address, customers.address)
    returning * into cust;

  insert into bookings(visit_id, customer_id, project_id, plot_id, area_guntha, rate_per_guntha, calculated_price,
                       proposed_price, approved_price, discount_approval, booking_date, status, partner_id)
    values (p_visit, cust.id, p_project, plot_row.id, p_area, p_rate, calc, p_final, approved, disc, p_date,
            case when disc = 'Pending Admin Approval' then 'Pending' else 'Confirmed' end, p_partner)
    returning id into bk_id;
  update plots set status = 'Reserved' where id = plot_row.id;
  if p_visit is not null then
    update site_visits set status = 'Converted to Booking', booking_id = bk_id where id = p_visit;
  end if;
  if p_adv_amount is not null then
    insert into payments(booking_id, partner_id, type, amount, payment_date, method, txn_ref, receipt)
      values (bk_id, p_partner, 'Booking Advance', p_adv_amount, p_adv_date, p_adv_method, btrim(p_adv_txn), p_adv_receipt)
      returning id into pay_id;
  end if;
  return jsonb_build_object('booking_id', bk_id, 'payment_id', pay_id);
end $$;

-- Admin decision on a below-calculated-price booking.
create or replace function review_discount(p_booking uuid, p_approve boolean, p_admin uuid, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare bk bookings%rowtype; admin_label text; new_price numeric;
begin
  select * into bk from bookings where id = p_booking for update;
  if not found or bk.discount_approval <> 'Pending Admin Approval' then raise exception 'no_pending_discount'; end if;
  new_price := case when p_approve then bk.proposed_price else bk.calculated_price end;
  if new_price < (select coalesce(sum(amount),0) from payments where booking_id = bk.id and status = 'Verified') then
    raise exception 'below_verified';
  end if;
  update bookings set discount_approval = case when p_approve then 'Approved' else 'Rejected' end,
         approved_price = new_price, status = 'Confirmed', discount_reason = p_note where id = bk.id;
  select email::text into admin_label from admin_users where id = p_admin;
  insert into audit_logs(actor_type, actor_id, actor_label, action, entity_type, entity_id, before_value, after_value, reason)
    values ('admin', p_admin::text, admin_label, case when p_approve then 'booking.price_approved' else 'booking.price_rejected' end,
            'booking', bk.id::text,
            jsonb_build_object('approved_price', bk.approved_price, 'proposed_price', bk.proposed_price, 'discount_approval', bk.discount_approval),
            jsonb_build_object('approved_price', new_price, 'discount_approval', case when p_approve then 'Approved' else 'Rejected' end), p_note);
  return jsonb_build_object('ok', true);
end $$;

-- Cancel a booking (frees the plot). Verified money must be refunded separately.
create or replace function cancel_booking(p_booking uuid, p_admin uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare bk bookings%rowtype; admin_label text;
begin
  select * into bk from bookings where id = p_booking for update;
  if not found then raise exception 'booking_not_found'; end if;
  if bk.status = 'Cancelled' then raise exception 'already_cancelled'; end if;
  update bookings set status = 'Cancelled', cancel_reason = p_reason where id = bk.id;
  update plots set status = 'Available' where id = bk.plot_id;
  update payments set status = 'Rejected', reviewed_at = now(), reviewed_by = p_admin, review_note = 'Booking cancelled'
    where booking_id = bk.id and status = 'Pending Verification';
  select email::text into admin_label from admin_users where id = p_admin;
  insert into audit_logs(actor_type, actor_id, actor_label, action, entity_type, entity_id, before_value, after_value, reason)
    values ('admin', p_admin::text, admin_label, 'booking.cancelled', 'booking', bk.id::text,
            jsonb_build_object('status', bk.status), jsonb_build_object('status', 'Cancelled'), p_reason);
  return jsonb_build_object('ok', true);
end $$;

-- Mark plots Sold once a booking is fully paid (verified == approved price); back to Reserved otherwise.
create or replace function sync_plot_status(p_booking uuid) returns void
language plpgsql security definer set search_path = public as $$
declare bk bookings%rowtype; v numeric;
begin
  select * into bk from bookings where id = p_booking;
  if not found or bk.status = 'Cancelled' then return; end if;
  select coalesce(sum(amount),0) into v from payments where booking_id = bk.id and status = 'Verified';
  update plots set status = case when v >= bk.approved_price then 'Sold' else 'Reserved' end where id = bk.plot_id;
end $$;

revoke all on function run_promotions(), review_payment(uuid,text,uuid,text),
  create_booking(text,uuid,text,text,text,text,uuid,text,numeric,numeric,numeric,date,numeric,date,text,text,text),
  review_discount(uuid,boolean,uuid,text), cancel_booking(uuid,uuid,text), sync_plot_status(uuid)
  from public, anon, authenticated;
grant execute on function run_promotions(), review_payment(uuid,text,uuid,text),
  create_booking(text,uuid,text,text,text,text,uuid,text,numeric,numeric,numeric,date,numeric,date,text,text,text),
  review_discount(uuid,boolean,uuid,text), cancel_booking(uuid,uuid,text), sync_plot_status(uuid)
  to service_role;
