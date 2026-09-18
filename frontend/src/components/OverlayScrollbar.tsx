import React, { useEffect, useRef, useState } from 'react';

const MIN_THUMB_HEIGHT = 32;
const FADE_DELAY_MS = 900;

/**
 * Visual scroll thumb overlaid on top of `targetRef`'s content instead of a
 * native scrollbar that reserves layout width — so switching tabs/pages
 * never resizes the content under it. `targetRef`'s element must hide its
 * native scrollbar (see `.scroll-overlay-host` in index.css) and be
 * positioned (relative/absolute) so this thumb can anchor to it.
 */
export const OverlayScrollbar: React.FC<{ targetRef: React.RefObject<HTMLElement> }> = ({ targetRef }) => {
  const [thumb, setThumb] = useState({ top: 0, height: 0 });
  const [visible, setVisible] = useState(false);
  const fadeTimeout = useRef<number | undefined>(undefined);
  const dragState = useRef<{ startY: number; startScrollTop: number } | null>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const measure = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight + 1) {
        setThumb({ top: 0, height: 0 });
        return;
      }
      const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, MIN_THUMB_HEIGHT);
      const maxTop = clientHeight - thumbHeight;
      const top = (scrollTop / (scrollHeight - clientHeight)) * maxTop;
      setThumb({ top, height: thumbHeight });
    };

    const showAndFade = () => {
      measure();
      setVisible(true);
      if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
      fadeTimeout.current = window.setTimeout(() => setVisible(false), FADE_DELAY_MS);
    };

    measure();
    el.addEventListener('scroll', showAndFade, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', showAndFade);
      ro.disconnect();
      if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
    };
  }, [targetRef]);

  const onThumbPointerDown = (e: React.PointerEvent) => {
    const el = targetRef.current;
    if (!el) return;
    e.preventDefault();
    dragState.current = { startY: e.clientY, startScrollTop: el.scrollTop };
    setVisible(true);

    const onMove = (ev: PointerEvent) => {
      if (!dragState.current) return;
      const thumbHeight = Math.max((el.clientHeight / el.scrollHeight) * el.clientHeight, MIN_THUMB_HEIGHT);
      const maxTop = el.clientHeight - thumbHeight;
      const scrollRange = el.scrollHeight - el.clientHeight;
      if (maxTop <= 0 || scrollRange <= 0) return;
      const deltaY = ev.clientY - dragState.current.startY;
      el.scrollTop = dragState.current.startScrollTop + (deltaY / maxTop) * scrollRange;
    };
    const onUp = () => {
      dragState.current = null;
      if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
      fadeTimeout.current = window.setTimeout(() => setVisible(false), FADE_DELAY_MS);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  if (thumb.height <= 0) return null;

  return (
    <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-2.5 z-40" aria-hidden="true">
      <div
        onPointerDown={onThumbPointerDown}
        className={`pointer-events-auto absolute right-0.5 w-1.5 rounded-full bg-slate-900/25 dark:bg-white/25 hover:bg-slate-900/45 dark:hover:bg-white/45 active:bg-slate-900/55 dark:active:bg-white/55 cursor-pointer transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ top: thumb.top, height: thumb.height }}
      />
    </div>
  );
};
