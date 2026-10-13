// Copertina di un viaggio: stato del modulo (CoverPicker) e salvataggio.
import { updateTrip } from '@/lib/api';
import { compressImage } from '@/lib/image';
import { supabase } from '@/lib/supabase';
import type { Trip } from '@/lib/types';

/** Stato della copertina scelta nel modulo (non ancora salvata). */
export interface CoverValue {
  /** Anteprima mostrata: URL salvato, data URL del file scelto o URL Unsplash. */
  preview: string | null;
  /** File caricato dall'utente: va compresso e salvato su Storage. */
  file: File | null;
  /** Copertina presa da Unsplash: si salva solo l'URL, nessun upload. */
  externalUrl: string | null;
  attribution: { name: string; profileUrl: string } | null;
  /** Posizione verticale dell'immagine, 0 = in alto, 100 = in basso. */
  positionY: number;
}

export const initialCover = (trip?: Pick<Trip, 'cover_image_url' | 'cover_position_y'> | null): CoverValue => ({
  preview: trip?.cover_image_url ?? null,
  file: null,
  externalUrl: null,
  attribution: null,
  positionY: trip?.cover_position_y ?? 0,
});

/** Salva la copertina sul viaggio già creato/aggiornato: carica il file, oppure
 * imposta l'URL Unsplash, oppure la rimuove, oppure aggiorna solo la posizione. */
export const saveCover = async (
  trip: Trip,
  userId: string,
  cover: CoverValue,
  previousUrl: string | null
): Promise<Trip> => {
  if (cover.file) {
    const compressed = await compressImage(cover.file);
    const path = `${userId}/${trip.id}-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('trip-covers')
      .upload(path, compressed, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('trip-covers').getPublicUrl(path);
    return updateTrip(trip.id, { cover_image_url: data.publicUrl, cover_position_y: cover.positionY });
  }
  if (cover.externalUrl && cover.externalUrl !== previousUrl) {
    return updateTrip(trip.id, { cover_image_url: cover.externalUrl, cover_position_y: cover.positionY });
  }
  if (cover.preview === null && previousUrl) {
    return updateTrip(trip.id, { cover_image_url: null, cover_position_y: 0 });
  }
  if (cover.positionY !== (trip.cover_position_y ?? 0)) {
    return updateTrip(trip.id, { cover_position_y: cover.positionY });
  }
  return trip;
};
