-- ============================================================================
-- JourneyAtlas - Migration 0018: Icona per attività + categorie personalizzate
-- Esegui questo script nel Supabase SQL Editor.
--
-- Rimuove il vincolo CHECK sulla categoria delle attività (stesso pattern già
-- usato per la Check List in 0003_checklist_custom_categories.sql), così da
-- permettere categorie create dall'utente, e aggiunge:
--   - colonna `icon` su activities (icona Lucide scelta per la singola
--     attività, non per la categoria — a differenza della Check List dove
--     l'icona è sulla categoria)
--   - tabella `activity_categories` (categorie personalizzate per viaggio,
--     così una categoria appena creata resta selezionabile anche prima che
--     un'attività la usi)
-- ============================================================================

alter table public.activities
  drop constraint if exists activities_category_check;

alter table public.activities
  add column if not exists icon text;

-- ----------------------------------------------------------------------------
-- Activity Categories
-- ----------------------------------------------------------------------------
create table if not exists public.activity_categories (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (trip_id, name)
);

comment on table public.activity_categories is 'Categorie personalizzate delle attività, per viaggio.';

create index if not exists idx_activity_categories_trip_id on public.activity_categories(trip_id);

alter table public.activity_categories enable row level security;

drop policy if exists "activity_categories_select" on public.activity_categories;
create policy "activity_categories_select"
  on public.activity_categories for select
  using (public.is_trip_participant(trip_id));

drop policy if exists "activity_categories_insert" on public.activity_categories;
create policy "activity_categories_insert"
  on public.activity_categories for insert
  with check (public.can_edit_trip(trip_id));

drop policy if exists "activity_categories_update" on public.activity_categories;
create policy "activity_categories_update"
  on public.activity_categories for update
  using (public.can_edit_trip(trip_id));

drop policy if exists "activity_categories_delete" on public.activity_categories;
create policy "activity_categories_delete"
  on public.activity_categories for delete
  using (public.can_edit_trip(trip_id));

-- ============================================================================
-- Fine migration
-- ============================================================================
