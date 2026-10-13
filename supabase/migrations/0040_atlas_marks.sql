-- ============================================================================
-- JourneyAtlas - Migration 0040: segni a mano sull'atlante
-- Esegui questo script nel Supabase SQL Editor.
--
-- L'atlante sblocca paesi e regioni in automatico dalle mete dei viaggi. Qui
-- l'utente può aggiungere a mano ciò che i viaggi non dicono (una regione solo
-- attraversata in auto, un paese visitato prima di usare l'app).
--
--   country_code: alpha-2 maiuscolo, oppure un codice "X-..." per gli stati a
--                 riconoscimento limitato senza ISO (es. X-ABK, Abcasia)
--   region_key:   '' = l'intero paese; altrimenti il nome della regione come
--                 nei confini dell'atlante (es. 'Toscana', 'California')
--
-- Righe private: ognuno vede e modifica solo le proprie.
-- ============================================================================

create table if not exists public.atlas_marks (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  country_code text not null check (country_code ~ '^([A-Z]{2}|X-[A-Z]{3})$'),
  region_key text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, country_code, region_key)
);

alter table public.atlas_marks enable row level security;

drop policy if exists "atlas_marks_select_own" on public.atlas_marks;
create policy "atlas_marks_select_own"
  on public.atlas_marks for select
  using (user_id = auth.uid());

drop policy if exists "atlas_marks_insert_own" on public.atlas_marks;
create policy "atlas_marks_insert_own"
  on public.atlas_marks for insert
  with check (user_id = auth.uid());

drop policy if exists "atlas_marks_delete_own" on public.atlas_marks;
create policy "atlas_marks_delete_own"
  on public.atlas_marks for delete
  using (user_id = auth.uid());

-- ============================================================================
-- Fine migration
-- ============================================================================
