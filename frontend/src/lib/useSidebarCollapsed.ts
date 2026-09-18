import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ja-sidebar-collapsed';

/** Rileva lo stato di espansione della sidebar (desktop) rileggendo
    localStorage e ascoltando l'evento emesso da AppLayout al toggle. */
export const useSidebarCollapsed = (): boolean => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onChange = () => {
      try {
        setCollapsed(localStorage.getItem(STORAGE_KEY) === 'true');
      } catch {
        /* ignore storage errors */
      }
    };
    window.addEventListener('ja-sidebar-toggle', onChange);
    return () => window.removeEventListener('ja-sidebar-toggle', onChange);
  }, []);

  return collapsed;
};