-- ============================================================================
-- JourneyAtlas - Migration 0021: Accommodation photo_path
-- (rinominata da 0019_accommodation_photo_path.sql: il numero 0019 era gia'
--  occupato da 0019_activity_duration.sql. Contenuto invariato, idempotente.)
-- ---------------------------------------------------------------------------
-- La 0020 aveva previsto `photo_url` ma non il path dell'oggetto su storage.
-- Senza il path non si può sapere WHICH file cancellare quando la foto viene
-- cambiata o rimossa, e in un viaggio condiviso il path derivato da
-- auth.uid() punta alla cartella di chi sta modificando, non di chi aveva
-- caricato la foto: ogni sostituzione lasciava un file orfano nel bucket.
--
-- `photo_path` memorizza il path esatto (es. "<userId>/<accId>.jpg"):
--   - la sostituzione sovrascrive lo stesso oggetto (nessun orfano)
--   - la rimozione elimina davvero l'oggetto
--   - la cancellazione dell'alloggio elimina la foto
-- ============================================================================

-- 1. Nuova colonna (idempotente)
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS photo_path text;

-- 2. Backfill: ricava il path dalla public URL già salvata.
--    Il separatore è '/storage/v1/object/public/accommodation-photos/'.
--    Se il marcatore non c'è (URL non standard) il path resta NULL e la
--    rimozione della foto degrada al solo azzeramento del riferimento.
UPDATE public.accommodations
SET photo_path = NULLIF(
      split_part(photo_url, '/storage/v1/object/public/accommodation-photos/', 2),
      ''
    )
WHERE photo_url IS NOT NULL
  AND photo_path IS NULL;

-- 3. Indice parziale: le righe con foto sono poche e le query su
--    photo_path sono sempre per uguaglianza.
CREATE INDEX IF NOT EXISTS idx_accommodations_photo_path
  ON public.accommodations (photo_path)
  WHERE photo_path IS NOT NULL;
