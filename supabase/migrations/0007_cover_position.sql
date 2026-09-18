-- ============================================================================
-- JourneyAtlas - Add cover_position_y to trips table
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================================

-- 1. Aggiungi la colonna cover_position_y (percentuale 0-100, default 0 = top)
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS cover_position_y INTEGER NOT NULL DEFAULT 0 CHECK (cover_position_y >= 0 AND cover_position_y <= 100);
