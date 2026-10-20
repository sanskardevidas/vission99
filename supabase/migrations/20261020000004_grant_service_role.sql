-- Backend (service_role) needs explicit grants; anon/authenticated stay locked out.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
