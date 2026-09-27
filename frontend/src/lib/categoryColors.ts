/** Categorical color assignment for activity categories (chart + card
 * accents). Colors themselves live as CSS variables in index.css
 * (`--cat-color-0` … `--cat-color-7`, `--cat-color-other`), validated with
 * the dataviz skill's validator against this app's brand colors and both
 * card surfaces (light/dark) — see that file's comment for the palette.
 * This module only assigns a *stable* slot index per category name, so the
 * same category always gets the same color regardless of filtering. */

const SLOT_COUNT = 8;

export const CATEGORY_OTHER_VAR = 'var(--cat-color-other)';

export const categoryColorVar = (index: number): string => `var(--cat-color-${index % SLOT_COUNT})`;

/** Builds a stable name -> CSS color var map from the *full, stably-sorted*
 * list of categories for a trip. Never derive this from a filtered subset —
 * that would repaint survivors' colors when the filter changes. */
export const buildCategoryColorMap = (orderedCategories: readonly string[]): Map<string, string> => {
  const map = new Map<string, string>();
  orderedCategories.forEach((cat, i) => map.set(cat, categoryColorVar(i)));
  return map;
};

export const getCategoryColor = (category: string | null, colorMap: Map<string, string>): string =>
  (category && colorMap.get(category)) || CATEGORY_OTHER_VAR;
