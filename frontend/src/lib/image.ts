/** Compress an image File to at most maxKB using Canvas. Returns a Blob. */
export async function compressImage(file: File, maxKB = 500): Promise<Blob> {
  const maxBytes = maxKB * 1024;
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');

  // Resize so longest side <= 1280px
  const maxSide = 1280;
  let { width, height } = bitmap;
  if (width > maxSide || height > maxSide) {
    if (width >= height) {
      height = Math.round((height / width) * maxSide);
      width = maxSide;
    } else {
      width = Math.round((width / height) * maxSide);
      height = maxSide;
    }
  }
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);

  // Iteratively reduce quality until under maxKB
  let quality = 0.85;
  let blob: Blob | null = null;
  while (quality >= 0.3) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (blob && blob.size <= maxBytes) break;
    quality -= 0.1;
  }
  // Last resort: very low quality
  if (!blob || blob.size > maxBytes) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.2)
    );
  }
  bitmap.close();
  return blob!;
}
