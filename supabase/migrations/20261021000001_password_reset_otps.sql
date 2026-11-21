-- One-time passwords for partner "forgot password". Only a hash of the code is stored.
-- Server-only: RLS enabled with no policies, so only the backend (service_role) can touch it.
create table if not exists password_reset_otps (
  id bigserial primary key,
  partner_id text not null references partners(id) on delete cascade,
  code_hash text not null,
  attempts int not null default 0,
  consumed boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists password_reset_otps_lookup_idx on password_reset_otps(partner_id, created_at desc);

alter table password_reset_otps enable row level security;
grant all on table password_reset_otps to service_role;
grant all on sequence password_reset_otps_id_seq to service_role;

-- Atomically claim one verification attempt. Increments attempts only while the OTP is still
-- usable (not consumed, under the attempt cap, not expired); returns true if an attempt was claimed.
create or replace function claim_otp_attempt(p_id bigint, p_max int)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  claimed int;
begin
  update password_reset_otps
     set attempts = attempts + 1
   where id = p_id
     and consumed = false
     and attempts < p_max
     and expires_at > now();
  get diagnostics claimed = row_count;
  return claimed > 0;
end;
$$;

revoke all on function claim_otp_attempt(bigint, int) from public, anon, authenticated;
grant execute on function claim_otp_attempt(bigint, int) to service_role;
