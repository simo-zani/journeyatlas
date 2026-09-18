-- ============================================================================
-- JourneyAtlas - Row Level Security per public.profiles
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- La tabella profiles ha RLS attiva ma non aveva nessuna policy: di
-- conseguenza NESSUNO (nemmeno il proprietario della riga) poteva leggere
-- o aggiornare il proprio profilo via API — è la causa del bug per cui lo
-- username/avatar non si vedevano nel modale Profilo pur essendo presenti
-- nel database.
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
