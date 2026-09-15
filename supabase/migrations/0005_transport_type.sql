-- ----------------------------------------------------------------------------
-- 15) Transport types on flights table
-- Generalizes the flights table to support multiple transport modes
-- (flight, train, bus, ferry, car, other). Existing rows default to 'flight'.
-- ----------------------------------------------------------------------------
alter table public.flights add column if not exists transport_type text not null default 'flight';

alter table public.flights drop constraint if exists flights_transport_type_check;
alter table public.flights add constraint flights_transport_type_check
  check (transport_type in ('flight', 'train', 'bus', 'ferry', 'car', 'other'));