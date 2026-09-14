-- ============================================================================
-- JourneyAtlas - Migration 0001: Core schema (Fase 1)
-- Esegui questo script nel Supabase SQL Editor.
-- Contiene: profili utente, viaggi, partecipanti, attività, voli, alloggi
-- + helper RLS e Row Level Security.
--
-- NOTA: le tabelle vengono create PRIMA delle funzioni helper RLS perché
-- PostgreSQL valida le funzioni SQL al momento della creazione.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Helper function: updated_at automatico
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2) Profiles (estensione dati di Supabase Auth)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  default_currency text default 'EUR',
  timezone text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Estensione dei dati di Supabase Auth con preferenze utente.';

-- Trigger: crea profilo automaticamente alla registrazione
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3) Trips
-- ----------------------------------------------------------------------------
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  start_date date,
  end_date date,
  destinations jsonb default '[]'::jsonb,
  budget_planned numeric(12, 2),
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists idx_trips_owner_id on public.trips(owner_id);
create index if not exists idx_trips_archived_at on public.trips(archived_at);

drop trigger if exists trg_trips_updated_at on public.trips;
create trigger trg_trips_updated_at
  before update on public.trips
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4) Trip Participants
-- ----------------------------------------------------------------------------
create table if not exists public.trip_participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'viewer'
    check (role in ('owner', 'editor', 'viewer')),
  invited_email text,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

create index if not exists idx_trip_participants_trip_id on public.trip_participants(trip_id);
create index if not exists idx_trip_participants_user_id on public.trip_participants(user_id);

-- ----------------------------------------------------------------------------
-- 5) Helper RLS
-- (create solo dopo le tabelle referenziate)
-- ----------------------------------------------------------------------------
create or replace function public.is_trip_owner(trip_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trip_participants
    where trip_id = is_trip_owner.trip_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.is_trip_participant(trip_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trip_participants
    where trip_id = is_trip_participant.trip_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.can_edit_trip(trip_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trip_participants
    where trip_id = can_edit_trip.trip_id
      and user_id = auth.uid()
      and role in ('owner', 'editor')
  );
$$;

-- ----------------------------------------------------------------------------
-- 6) RLS: Trips
-- ----------------------------------------------------------------------------
alter table public.trips enable row level security;

drop policy if exists "trips_select_participants" on public.trips;
create policy "trips_select_participants"
  on public.trips for select
  using (
    owner_id = auth.uid()
    or public.is_trip_owner(id)
    or public.is_trip_participant(id)
  );

drop policy if exists "trips_insert_owner" on public.trips;
create policy "trips_insert_owner"
  on public.trips for insert
  with check (auth.uid() = owner_id);

drop policy if exists "trips_update_owner" on public.trips;
create policy "trips_update_owner"
  on public.trips for update
  using (public.is_trip_owner(id));

drop policy if exists "trips_delete_owner" on public.trips;
create policy "trips_delete_owner"
  on public.trips for delete
  using (public.is_trip_owner(id));

-- ----------------------------------------------------------------------------
-- 7) RLS: Trip Participants
-- ----------------------------------------------------------------------------
alter table public.trip_participants enable row level security;

drop policy if exists "trip_participants_select" on public.trip_participants;
create policy "trip_participants_select"
  on public.trip_participants for select
  using (
    user_id = auth.uid()
    or public.is_trip_owner(trip_id)
    or public.is_trip_participant(trip_id)
  );

drop policy if exists "trip_participants_insert_owner" on public.trip_participants;
create policy "trip_participants_insert_owner"
  on public.trip_participants for insert
  with check (public.is_trip_owner(trip_id) or user_id = auth.uid());

drop policy if exists "trip_participants_update_owner" on public.trip_participants;
create policy "trip_participants_update_owner"
  on public.trip_participants for update
  using (public.is_trip_owner(trip_id));

drop policy if exists "trip_participants_delete_owner" on public.trip_participants;
create policy "trip_participants_delete_owner"
  on public.trip_participants for delete
  using (public.is_trip_owner(trip_id));

-- ----------------------------------------------------------------------------
-- 8) Activities
-- ----------------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  description text,
  activity_date date,
  activity_time time,
  location_city text,
  location_address text,
  category text check (category in ('attrazione', 'ristorante', 'transport', 'evento', 'altro')),
  status text not null default 'planned' check (status in ('planned', 'booked', 'completed')),
  booking_ref text,
  notes text,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_trip_id on public.activities(trip_id);

alter table public.activities enable row level security;

drop policy if exists "activities_select" on public.activities;
create policy "activities_select"
  on public.activities for select
  using (public.is_trip_participant(trip_id));

drop policy if exists "activities_insert" on public.activities;
create policy "activities_insert"
  on public.activities for insert
  with check (
    public.can_edit_trip(trip_id)
    and created_by_user_id = auth.uid()
  );

drop policy if exists "activities_update" on public.activities;
create policy "activities_update"
  on public.activities for update
  using (public.can_edit_trip(trip_id));

drop policy if exists "activities_delete" on public.activities;
create policy "activities_delete"
  on public.activities for delete
  using (public.can_edit_trip(trip_id));

-- ----------------------------------------------------------------------------
-- 9) Flights
-- ----------------------------------------------------------------------------
create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  departure_airport text not null,
  arrival_airport text not null,
  departure_datetime timestamptz,
  arrival_datetime timestamptz,
  airline text,
  flight_number text,
  booking_ref text,
  passengers jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_flights_trip_id on public.flights(trip_id);

alter table public.flights enable row level security;

drop policy if exists "flights_select" on public.flights;
create policy "flights_select"
  on public.flights for select
  using (public.is_trip_participant(trip_id));

drop policy if exists "flights_insert" on public.flights;
create policy "flights_insert"
  on public.flights for insert
  with check (public.can_edit_trip(trip_id));

drop policy if exists "flights_update" on public.flights;
create policy "flights_update"
  on public.flights for update
  using (public.can_edit_trip(trip_id));

drop policy if exists "flights_delete" on public.flights;
create policy "flights_delete"
  on public.flights for delete
  using (public.can_edit_trip(trip_id));

-- ----------------------------------------------------------------------------
-- 10) Accommodations
-- ----------------------------------------------------------------------------
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  type text not null default 'hotel' check (type in ('hotel', 'airbnb', 'house', 'apartment')),
  address text,
  coordinates jsonb,
  check_in_date date,
  check_in_time time,
  check_out_date date,
  check_out_time time,
  cost_total numeric(12, 2),
  currency text default 'EUR',
  rooms jsonb default '[]'::jsonb,
  contact_info jsonb,
  booking_ref text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_accommodations_trip_id on public.accommodations(trip_id);

alter table public.accommodations enable row level security;

drop policy if exists "accommodations_select" on public.accommodations;
create policy "accommodations_select"
  on public.accommodations for select
  using (public.is_trip_participant(trip_id));

drop policy if exists "accommodations_insert" on public.accommodations;
create policy "accommodations_insert"
  on public.accommodations for insert
  with check (public.can_edit_trip(trip_id));

drop policy if exists "accommodations_update" on public.accommodations;
create policy "accommodations_update"
  on public.accommodations for update
  using (public.can_edit_trip(trip_id));

drop policy if exists "accommodations_delete" on public.accommodations;
create policy "accommodations_delete"
  on public.accommodations for delete
  using (public.can_edit_trip(trip_id));

-- ============================================================================
-- Fine migration
-- ============================================================================