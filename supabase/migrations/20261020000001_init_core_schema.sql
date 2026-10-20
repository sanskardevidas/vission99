-- VISSION99 AQAAR — clean core schema. Server-only access: RLS is enabled on every table with
-- NO policies for anon/authenticated, so only the backend (service_role) can read or write.
-- No business data is seeded here.

create extension if not exists citext with schema extensions;

-- ---------- Sequences for human-readable references ----------
create sequence partner_id_seq start 1;
create sequence visit_ref_seq start 1;
create sequence booking_ref_seq start 1;
create sequence payment_ref_seq start 1;
create sequence refund_ref_seq start 1;

-- ---------- Admin accounts ----------
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email extensions.citext not null unique,
  full_name text not null default 'Administrator',
  password_hash text not null,
  role text not null default 'admin' check (role in ('super_admin','admin','finance')),
  must_change_password boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- ---------- Partners (CP / PP / MG) ----------
create table partners (
  id text primary key default ('CP' || (100000 + nextval('partner_id_seq'))), -- permanent; never changes on promotion
  full_name text not null check (length(btrim(full_name)) > 0),
  mobile text not null unique check (mobile ~ '^[6-9][0-9]{9}$'),               -- canonical 10-digit Indian mobile
  password_hash text not null,
  role text not null default 'CP' check (role in ('CP','PP','MG')),
  referred_by text references partners(id),
  status text not null default 'Active' check (status in ('Active','Inactive')),
  kyc_status text not null default 'Not Submitted',
  kyc_details jsonb,
  joined_at timestamptz not null default now(),
  check (referred_by is null or referred_by <> id)
);
create index partners_referred_by_idx on partners(referred_by);

create table partner_role_history (
  id bigserial primary key,
  partner_id text not null references partners(id),
  from_role text check (from_role in ('CP','PP','MG')),
  to_role text not null check (to_role in ('CP','PP','MG')),
  reason text not null check (reason in ('registration','auto_promotion','admin_change')),
  changed_by_admin uuid references admin_users(id),
  celebration_shown boolean not null default true,
  created_at timestamptz not null default now()
);
create index partner_role_history_partner_idx on partner_role_history(partner_id);

-- ---------- Sessions & login throttling ----------
create table sessions (
  token_hash text primary key,
  kind text not null check (kind in ('partner','admin')),
  partner_id text references partners(id) on delete cascade,
  admin_id uuid references admin_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check ((kind = 'partner' and partner_id is not null and admin_id is null) or
         (kind = 'admin' and admin_id is not null and partner_id is null))
);
create index sessions_expires_idx on sessions(expires_at);

create table login_attempts (
  id bigserial primary key,
  scope text not null,           -- 'partner' | 'admin' | 'register'
  identifier text not null,      -- mobile / email / ip bucket
  ip text,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index login_attempts_lookup_idx on login_attempts(scope, identifier, created_at desc);
create index login_attempts_ip_idx on login_attempts(scope, ip, created_at desc);

-- ---------- Projects, plots ----------
create table inventory_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text,
  status text not null default 'Active' check (status in ('Active','Inactive')),
  created_at timestamptz not null default now()
);

create table plots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references inventory_projects(id),
  plot_number text not null,
  area_guntha numeric(12,3) check (area_guntha is null or area_guntha > 0),
  status text not null default 'Available' check (status in ('Available','Reserved','Sold')),
  created_at timestamptz not null default now()
);
create unique index plots_project_number_uidx on plots(project_id, lower(plot_number));

-- ---------- Customers ----------
create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  mobile text not null unique check (mobile ~ '^[6-9][0-9]{9}$'),
  email text,
  address text,
  source_partner_id text not null references partners(id), -- first attribution; never rewritten
  created_at timestamptz not null default now()
);

-- ---------- Site visits ----------
create table site_visits (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('SV-' || lpad(nextval('visit_ref_seq')::text, 5, '0')),
  customer_name text not null,
  mobile text not null check (mobile ~ '^[6-9][0-9]{9}$'),
  email text,
  project_id uuid not null references inventory_projects(id),
  visit_date date not null,
  visit_time text not null,
  visitors integer not null check (visitors >= 1),
  notes text,
  status text not null default 'Scheduled'
    check (status in ('Scheduled','Confirmed','Completed','Cancelled','Converted to Booking')),
  partner_id text not null references partners(id),
  booking_id uuid,
  created_at timestamptz not null default now()
);
create index site_visits_partner_idx on site_visits(partner_id);

-- ---------- Bookings ----------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('BK-' || lpad(nextval('booking_ref_seq')::text, 5, '0')),
  visit_id uuid references site_visits(id),
  customer_id uuid not null references customers(id),
  project_id uuid not null references inventory_projects(id),
  plot_id uuid not null references plots(id),
  area_guntha numeric(12,3) not null check (area_guntha > 0),
  rate_per_guntha numeric(14,2) not null check (rate_per_guntha > 0),
  calculated_price numeric(14,2) not null check (calculated_price > 0),
  proposed_price numeric(14,2) not null check (proposed_price > 0),
  approved_price numeric(14,2) not null check (approved_price > 0), -- price all balances are measured against
  discount_approval text not null default 'Not Required'
    check (discount_approval in ('Not Required','Pending Admin Approval','Approved','Rejected')),
  discount_reason text,
  booking_date date not null,
  status text not null default 'Confirmed' check (status in ('Pending','Confirmed','Cancelled')),
  cancel_reason text,
  partner_id text not null references partners(id),
  created_at timestamptz not null default now()
);
create index bookings_partner_idx on bookings(partner_id);
create index bookings_project_idx on bookings(project_id);
-- one live booking per plot, enforced by the database
create unique index bookings_one_active_per_plot on bookings(plot_id) where status <> 'Cancelled';
alter table site_visits add constraint site_visits_booking_fk foreign key (booking_id) references bookings(id);

-- ---------- Payments ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('PAY-' || lpad(nextval('payment_ref_seq')::text, 5, '0')),
  booking_id uuid not null references bookings(id),
  partner_id text not null references partners(id), -- submitter
  type text not null check (type in ('Booking Advance','Installment','Final Payment')),
  amount numeric(14,2) not null check (amount > 0),
  payment_date date not null,
  method text not null check (method in ('UPI','Bank Transfer','RTGS','NEFT','IMPS','Cheque','Cash')),
  txn_ref text not null check (length(btrim(txn_ref)) > 0),
  receipt text,
  status text not null default 'Pending Verification' check (status in ('Pending Verification','Verified','Rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references admin_users(id),
  review_note text,
  check ((status = 'Pending Verification') = (reviewed_at is null))
);
create index payments_booking_idx on payments(booking_id);
create index payments_status_idx on payments(status);
create unique index payments_txn_ref_active_uidx on payments(lower(btrim(txn_ref))) where status <> 'Rejected';

create table refunds (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('RF-' || lpad(nextval('refund_ref_seq')::text, 5, '0')),
  booking_id uuid not null references bookings(id),
  amount numeric(14,2) not null check (amount > 0),
  status text not null default 'Approved' check (status in ('Pending','Approved','Rejected')),
  reason text not null,
  created_by uuid not null references admin_users(id),
  created_at timestamptz not null default now()
);

-- ---------- Commissions & payouts (no calculation engine yet; tables only) ----------
create table commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id text not null references partners(id),
  booking_id uuid references bookings(id),
  payment_id uuid references payments(id),
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'Pending' check (status in ('Pending','Approved','Paid')),
  created_at timestamptz not null default now()
);
create table payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id text not null references partners(id),
  amount numeric(14,2) not null check (amount > 0),
  reference text,
  paid_at timestamptz,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now()
);

-- ---------- Audit log (append-only) ----------
create table audit_logs (
  id bigserial primary key,
  actor_type text not null check (actor_type in ('admin','partner','system')),
  actor_id text,
  actor_label text,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_value jsonb,
  after_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on audit_logs(created_at desc);
create index audit_logs_action_idx on audit_logs(action);

-- ---------- Row Level Security: deny everything to anon / authenticated ----------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
revoke all on all sequences in schema public from anon, authenticated;

create or replace function prevent_audit_mutation() returns trigger language plpgsql as $$
begin raise exception 'audit_logs is append-only'; end $$;
create trigger audit_logs_no_update before update or delete on audit_logs
  for each row execute function prevent_audit_mutation();
