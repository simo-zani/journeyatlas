/**
 * Ritaglia al centro un'immagine in un quadrato e la riduce a pochi KB (data URL),
 * pensata per essere salvata direttamente in una colonna di testo.
 */
const MAX_BYTES = 8 * 1024;

export async function fileToLogoDataUrl(file: File, size = 96): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    let side = size;
    let url = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      const canvas = document.createElement('canvas');
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas');
      const crop = Math.min(bitmap.width, bitmap.height);
      ctx.drawImage(
        bitmap,
        (bitmap.width - crop) / 2,
        (bitmap.height - crop) / 2,
        crop,
        crop,
        0,
        0,
        side,
        side
      );
      // webp mantiene la trasparenza; dove non è supportato il browser ripiega su png
      url = canvas.toDataURL('image/webp', 0.8);
      if (url.length * 0.75 <= MAX_BYTES) return url;
      side = Math.round(side * 0.75);
    }
    return url;
  } finally {
    bitmap.close();
  }
}
