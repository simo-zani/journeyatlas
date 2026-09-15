export type Theme = 'light' | 'dark';

// The app defaults to dark mode until the user explicitly picks a theme —
// no system-preference lookup here on purpose. index.html applies the same
// default synchronously (before paint) so there is never a light-mode flash.
const DEFAULT_THEME: Theme = 'dark';

export const getTheme = (): Theme => {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return DEFAULT_THEME;
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
};

export const setTheme = (theme: Theme) => {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};

/** Re-applies the current theme. Safe to call redundantly on app mount as a
 * no-op safety net alongside the inline script in index.html. */
export const initTheme = () => {
  applyTheme(getTheme());
};
