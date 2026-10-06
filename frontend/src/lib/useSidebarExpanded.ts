import { useEffect, useState } from 'react';

const SIDEBAR_STORAGE_KEY = 'ja-sidebar-collapsed';

const read = (): boolean => {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
};

/** True quando la sidebar desktop è fissata estesa (l'hover sulla sidebar chiusa non conta: lì il contenuto non si restringe). */
export function useSidebarExpanded(): boolean {
  const [expanded, setExpanded] = useState(read);
  useEffect(() => {
    const sync = () => setExpanded(read());
    window.addEventListener('ja-sidebar-toggle', sync);
    return () => window.removeEventListener('ja-sidebar-toggle', sync);
  }, []);
  return expanded;
}
