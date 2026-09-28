-- ============================================================================
-- JourneyAtlas - Migration 0023: Accommodation rooms count
-- Quante camere sono state prenotate in un hotel.
--
--   - rooms_count  smallint NULL  (>= 1, NULL = non specificato)
--
-- È un semplice conteggio per mostrare "3 camere" sulla card. La colonna
-- `rooms` (jsonb, dal 0001) resta quella prevista per il dettaglio per camera
-- (capienza, chi dorme dove): questo contatore non la sostituisce, la affianca.
-- Vale solo per gli hotel: su un appartamento è sempre l'intero, quindi il
-- form non lo chiede e non lo salva.
--
-- smallint come `stars`: il range è 1..99 e occupa 2 byte invece di 4.
-- Il vincolo è a livello di tabella, non di colonna, quindi si DROP prima
-- (idempotente).
-- ============================================================================

-- 1. Colonna
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS rooms_count smallint;

-- 2. Vincolo >= 1, ricreato in modo idempotente
ALTER TABLE public.accommodations
  DROP CONSTRAINT IF EXISTS accommodations_rooms_count_check;

ALTER TABLE public.accommodations
  ADD CONSTRAINT accommodations_rooms_count_check
    CHECK (rooms_count IS NULL OR rooms_count >= 1);
