-- Reference data only (the company's existing project). No plots, customers, bookings or money.
insert into inventory_projects(name, location) values ('DAS CITY — DIGHI PORT', 'Dighi Port') on conflict (name) do nothing;
