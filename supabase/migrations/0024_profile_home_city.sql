-- ============================================================================
-- JourneyAtlas - Migration 0024: Profile home city
-- La città in cui l'utente parte di solito.
--
--   - home_city        text NULL
--   - home_city_coords jsonb NULL   -- { lat, lon }, come accommodations.coordinates
--
-- A cosa serve: quando si aggiunge un volo, il campo aeroporto offre in cima
-- gli aeroporti più vicini a questa città (gli stessi che da Cologno Monzese
-- sono Linate, Orio al Serio e Malpensa, non quelli di un'altra regione). Se
-- non è impostata il campo resta semplice ricerca libera.
--
-- Le coordinate viaggiano con la città perché sono la base del calcolo della
-- distanza: ricalcolarle a ogni apertura del form significa una richiesta in
-- più per ogni utente, e la città scelta dal picker è già esatta.
-- ============================================================================

-- 1. Colonne
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS home_city text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS home_city_coords jsonb;
