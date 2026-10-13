-- ============================================================================
-- JourneyAtlas - Migration 0042: lettura delle tabelle di riferimento
-- Esegui questo script nel Supabase SQL Editor.
--
-- country_continents ha la Row Level Security attiva ma nessuna policy: dal
-- client risultava vuota, e l'atlante mostrava sempre "Continenti 0/7".
-- (Il profilo pubblico non ne risentiva: get_traveler_profile è SECURITY
-- DEFINER.) Sono dati pubblici e immutabili: lettura per tutti gli utenti
-- autenticati, nessuna scrittura. Stessa regola per sovereign_countries (0041),
-- così si comporta allo stesso modo qualunque sia lo stato della sua RLS.
-- ============================================================================

alter table public.country_continents enable row level security;

drop policy if exists "country_continents_read" on public.country_continents;
create policy "country_continents_read"
  on public.country_continents for select
  to authenticated
  using (true);

alter table public.sovereign_countries enable row level security;

drop policy if exists "sovereign_countries_read" on public.sovereign_countries;
create policy "sovereign_countries_read"
  on public.sovereign_countries for select
  to authenticated
  using (true);

-- ============================================================================
-- Fine migration
-- ============================================================================
