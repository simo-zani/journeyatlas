-- ============================================================================
-- JourneyAtlas - Migration 0002: Checklist items (sezione "Check List")
-- Esegui questo script nel Supabase SQL Editor.
-- Contiene: tabella checklist_items + RLS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Checklist Items
-- ----------------------------------------------------------------------------
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  category text check (category in ('documenti', 'abbigliamento', 'toilette', 'elettronica', 'salute', 'altro')),
  quantity integer not null default 1 check (quantity >= 1),
  notes text,
  packed boolean not null default false,
  packed_by_user_id uuid references auth.users(id) on delete set null,
  packed_at timestamptz,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.checklist_items is 'Voce della check list di viaggio (ex packing list).';

create index if not exists idx_checklist_items_trip_id on public.checklist_items(trip_id);
create index if not exists idx_checklist_items_created_by on public.checklist_items(created_by_user_id);

-- ----------------------------------------------------------------------------
-- 2) RLS: Checklist Items
-- ----------------------------------------------------------------------------
alter table public.checklist_items enable row level security;

drop policy if exists "checklist_items_select" on public.checklist_items;
create policy "checklist_items_select"
  on public.checklist_items for select
  using (public.is_trip_participant(trip_id));

drop policy if exists "checklist_items_insert" on public.checklist_items;
create policy "checklist_items_insert"
  on public.checklist_items for insert
  with check (
    public.can_edit_trip(trip_id)
    and created_by_user_id = auth.uid()
  );

drop policy if exists "checklist_items_update" on public.checklist_items;
create policy "checklist_items_update"
  on public.checklist_items for update
  using (public.can_edit_trip(trip_id));

drop policy if exists "checklist_items_delete" on public.checklist_items;
create policy "checklist_items_delete"
  on public.checklist_items for delete
  using (public.can_edit_trip(trip_id));

-- ============================================================================
-- Fine migration
-- ============================================================================