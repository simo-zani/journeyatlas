-- ============================================================================
-- JourneyAtlas - Migration 0018: Accommodation v2
-- Aggiunge le nuove colonne alla tabella accommodations:
--   - type semplificato a hotel/apartment
--   - booking_url      (link diretto alla prenotazione)
--   - booking_platform (nome piattaforma, es. "Booking.com")
--   - city             (città – searchable, testo libero)
--   - contact_phone    (telefono proprietà)
--   - contact_email    (email proprietà)
--   - amenities        (array JSONB di optional: piscina, parcheggio, ...)
--   - photo_url        (URL foto compressa dell'alloggio)
-- ============================================================================

-- 1. Allarga il vincolo CHECK sul campo type (hotel | apartment)
--    Nota: in PostgreSQL non si può DROP/ADD CHECK su colonne esistenti direttamente,
--    quindi dobbiamo usare un constraint con nome.
ALTER TABLE public.accommodations
  DROP CONSTRAINT IF EXISTS accommodations_type_check;

ALTER TABLE public.accommodations
  ALTER COLUMN type TYPE text,
  ALTER COLUMN type SET DEFAULT 'hotel';

ALTER TABLE public.accommodations
  ADD CONSTRAINT accommodations_type_check
    CHECK (type IN ('hotel', 'apartment'));

-- Normalizza i valori legacy al tipo più vicino
UPDATE public.accommodations SET type = 'apartment' WHERE type IN ('airbnb', 'house');

-- 2. Nuove colonne (idempotenti)
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS booking_url     text,
  ADD COLUMN IF NOT EXISTS booking_platform text,
  ADD COLUMN IF NOT EXISTS city            text,
  ADD COLUMN IF NOT EXISTS contact_phone   text,
  ADD COLUMN IF NOT EXISTS contact_email   text,
  ADD COLUMN IF NOT EXISTS amenities       jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS photo_url       text;

-- 3. Storage bucket per le foto alloggi
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'accommodation-photos',
  'accommodation-photos',
  true,
  524288,  -- 512 KB hard cap server-side
  array['image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = true,
      file_size_limit    = 524288,
      allowed_mime_types = array['image/jpeg', 'image/webp'];

-- 4. RLS sul bucket
DROP POLICY IF EXISTS "acc_photos_select_public"  ON storage.objects;
CREATE POLICY "acc_photos_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'accommodation-photos');

DROP POLICY IF EXISTS "acc_photos_insert_owner" ON storage.objects;
CREATE POLICY "acc_photos_insert_owner"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'accommodation-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "acc_photos_update_owner" ON storage.objects;
CREATE POLICY "acc_photos_update_owner"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'accommodation-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "acc_photos_delete_owner" ON storage.objects;
CREATE POLICY "acc_photos_delete_owner"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'accommodation-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
