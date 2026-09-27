-- ============================================================================
-- JourneyAtlas - Migration 0020: Accommodation stars
-- Aggiunge la classificazione a stelle degli hotel.
--
--   - stars  smallint NULL  (1..5, NULL = non valutata)
--
-- smallint e non integer: il range è 1-5 e occupa 2 byte invece di 4.
-- Il vincolo è a livello di tabella, non di colonna, così `ADD CONSTRAINT
-- IF NOT EXISTS`... Postgres non lo supporta, quindi si DROP prima (idempotente).
-- ============================================================================

-- 1. Colonna
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS stars smallint;

-- 2. Vincolo 1..5, ricreato in modo idempotente
ALTER TABLE public.accommodations
  DROP CONSTRAINT IF EXISTS accommodations_stars_check;

ALTER TABLE public.accommodations
  ADD CONSTRAINT accommodations_stars_check
    CHECK (stars IS NULL OR (stars >= 1 AND stars <= 5));

-- 3. Dati legacy: sanifica qualsiasi valore già presente fuori range
--    (può succedere se la colonna esisteva senza vincolo in un ambiente diverso)
UPDATE public.accommodations
   SET stars = NULL
 WHERE stars IS NOT NULL
   AND (stars < 1 OR stars > 5);
