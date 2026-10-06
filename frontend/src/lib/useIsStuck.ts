import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Dice se un elemento `sticky` si è agganciato. Si mette `sentinelRef` su un
 * elemento a altezza zero subito prima della barra: quando risale sopra `offset`
 * (il `top` della barra, in px) la barra sta restando ferma mentre il contenuto scorre.
 */
export function useIsStuck(offset: number) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  const update = useCallback(() => {
    const el = sentinelRef.current;
    if (el) setStuck(el.getBoundingClientRect().top < offset);
  }, [offset]);

  useEffect(() => {
    update();
    // capture: intercetta anche lo scroll di contenitori annidati, non solo della finestra
    window.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  return [sentinelRef, stuck] as const;
}
