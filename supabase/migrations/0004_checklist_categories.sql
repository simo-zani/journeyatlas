-- ============================================================================
-- JourneyAtlas - Migration 0004: Categorie Check List con icona
-- Esegui questo script nel Supabase SQL Editor.
-- Contiene: tabella checklist_categories (nome univoco per viaggio + icona).
-- Le *categorie predefinite* (documenti, abbigliamento, ...) non hanno righe
-- in questa tabella: la loro icona default è hardcoded nel client. La tabella
-- serve per le categorie personalizzate e il loro set di icone.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Checklist Categories
-- ----------------------------------------------------------------------------
create table if not exists public.checklist_categories (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  icon text not null default 'tag',
  created_at timestamptz not null default now(),
  unique (trip_id, name)
);

comment on table public.checklist_categories is 'Categorie personalizzate della check list con icona (Lucide).';

create index if not exists idx_checklist_categories_trip_id on public.checklist_categories(trip_id);

-- ----------------------------------------------------------------------------
-- 2) RLS: Checklist Categories
-- ----------------------------------------------------------------------------
alter table public.checklist_categories enable row level security;

drop policy if exists "checklist_categories_select" on public.checklist_categories;
create policy "checklist_categories_select"
  on public.checklist_categories for select
  using (public.is_trip_participant(trip_id));

drop policy if exists "checklist_categories_insert" on public.checklist_categories;
create policy "checklist_categories_insert"
  on public.checklist_categories for insert
  with check (public.can_edit_trip(trip_id));

drop policy if exists "checklist_categories_update" on public.checklist_categories;
create policy "checklist_categories_update"
  on public.checklist_categories for update
  using (public.can_edit_trip(trip_id));

drop policy if exists "checklist_categories_delete" on public.checklist_categories;
create policy "checklist_categories_delete"
  on public.checklist_categories for delete
  using (public.can_edit_trip(trip_id));

-- ============================================================================
-- Fine migration
-- ============================================================================