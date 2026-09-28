import { useEffect, useState } from 'react';

/**
 * Analizza l'angolo in alto a sinistra di un'immagine (dove la testata del
 * viaggio sovrappone testo alla cover) e dice se è abbastanza chiaro da
 * richiedere testo scuro invece che chiaro sopra — non il tema chiaro/scuro
 * dell'app, il colore vero della foto in quel punto, che cambia da viaggio a
 * viaggio.
 *
 * `fetch` invece di un `<img crossOrigin>` + canvas: i bucket pubblici di
 * Supabase Storage rispondono già con CORS aperto, quindi il fetch va a
 * buon fine e il blob risultante non "tinge" il canvas — stesso risultato,
 * senza dover impostare crossOrigin sull'immagine visibile in pagina.
 */
export const useImageBrightness = (url: string | null | undefined): boolean | null => {
  const [isLight, setIsLight] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLight(null);
    if (!url) return;
    let active = true;

    void (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);

        const w = 32;
        const h = Math.max(1, Math.round((bitmap.height / bitmap.width) * w));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(bitmap, 0, 0, w, h);

        // Il testo occupa circa la metà sinistra e i due terzi superiori
        // della cover: si campiona quella zona, non l'immagine intera.
        const sampleW = Math.max(1, Math.round(w * 0.55));
        const sampleH = Math.max(1, Math.round(h * 0.65));
        const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

        let total = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          // Luminanza relativa (Rec. 709): l'occhio pesa il verde più del blu.
          total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          count++;
        }
        if (active && count > 0) setIsLight(total / count > 150);
      } catch {
        // CORS bloccato, rete assente, formato non decodificabile: resta su
        // null, il chiamante ricade sul trattamento di default (testo chiaro).
      }
    })();

    return () => {
      active = false;
    };
  }, [url]);

  return isLight;
};
