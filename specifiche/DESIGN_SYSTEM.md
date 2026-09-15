# Travel App — Design System

> This file describes the *system*, not a copy of the code. For the actual
> implementation, always read the source — copying it here just goes stale.
> Source of truth:
> - `frontend/tailwind.config.js` — palette, radii, shadows, easing, keyframes
> - `frontend/src/index.css` — CSS variables (surfaces/borders/overlay), base
>   styles, component classes (`.card`, `.btn-*`, `.input-field`, `.badge-*`,
>   `.alert-*`, `.empty-state*`, `.tab-pill`, `.glass-surface`, `.surface-panel`)
> - `frontend/src/components/*` — Button, Card, Input, Badge, Alert, Modal
> - `frontend/src/utils/theme.ts` — theme persistence/default logic

## Direction

Same blue & gold palette as before, but the goal is "premium editorial
travel brand", not "generic AI-generated SaaS dashboard". In practice that
means:

- **No thick colored borders as decoration.** The old `border-l-4
  border-gold` on every card/button/badge is gone. Gold now shows up as a
  thin ring, a soft glow, or a 2px gradient line that only appears on
  hover — an accent you notice, not a slab you can't miss.
- **Layered surfaces, not flat white/slate-800 boxes.** Backgrounds come
  from `--surface-0/1/2/3` CSS variables (see below), giving real depth
  between page background, cards and raised panels (dropdowns, modals) in
  both themes.
- **Motion has weight and intent.** Hovers lift (`translateY` + shadow),
  modals scale+fade with a spring-like easing, tab/nav selection slides
  between items (`framer-motion` `layoutId`), route changes cross-fade.
  Everything shares one easing curve (`cubic-bezier(0.16, 1, 0.3, 1)`,
  Tailwind's `ease-premium`) so it reads as one system, not a grab-bag of
  `transition-all`.
- **Softer semantic color usage.** Badges/alerts use tinted 15%-opacity
  backgrounds with a solid-colored label instead of solid color blocks.
- **A quiet serif for hero moments.** `font-display` (Fraunces) is used
  only for `<h1>` — page titles, the app name on auth screens — to give
  the UI an editorial anchor point against the Inter/Poppins UI chrome.
  Don't spread it to body copy or buttons.

## Surfaces (CSS variables, `src/index.css`)

Defined once on `:root` and overridden on `.dark`, so a theme switch is a
single coherent value swap rather than N independent `dark:` utilities:

| Variable | Role |
|---|---|
| `--surface-0` | page background |
| `--surface-1` | cards, raised content |
| `--surface-2` | hover / subtle alt surface |
| `--surface-3` | pressed / recessed surface |
| `--border-subtle` / `--border-strong` | hairline borders, by weight |
| `--overlay` | modal/drawer backdrop |
| `--ring-gold` | focus/glow accent |

Use them via inline `style={{ backgroundColor: 'var(--surface-0)' }}` (or
the `.card` / `.surface-panel` / `.glass-surface` classes) rather than
re-introducing `bg-white dark:bg-slate-800`-style pairs — that pattern is
exactly what caused the old inconsistent, half-transitioning dark mode.

## Dark mode: default + no-flash (bug fix)

Two things were broken before and are now fixed:

1. **Nothing ever applied the theme on first load.** `Header.tsx` read
   `getTheme()` into React state, but no code ever called
   `document.documentElement.classList.add('dark')` on mount — the class
   was only ever set from the toggle button. So a fresh page load always
   rendered light regardless of stored/preferred theme, until you clicked
   the toggle once.
2. **The switch wasn't uniform.** Only elements with an explicit
   `transition-colors`/`transition-all` utility animated; everything else
   flipped instantly, so the toggle looked laggy/inconsistent.

Fix:

- `frontend/index.html` has a small blocking inline `<script>` in `<head>`,
  before any stylesheet, that reads `localStorage.theme` and toggles the
  `dark` class **synchronously before first paint** — defaulting to
  `"dark"` when nothing is stored yet (per product decision: the app now
  starts in dark mode by default, it does not check
  `prefers-color-scheme`).
- `frontend/src/utils/theme.ts` mirrors that same default and exposes
  `initTheme()`, called once in `main.tsx` as a redundant safety net.
- `frontend/src/index.css` applies one global transition rule for
  `background-color, border-color, color, box-shadow, fill, stroke` on
  `*`, so every element animates the theme switch together instead of a
  subset of them.

## Motion conventions

- Easing: `ease-premium` (`cubic-bezier(0.16, 1, 0.3, 1)`) everywhere —
  Tailwind transitions and `framer-motion` `transition` props alike.
- Card/list entrances: stagger via `framer-motion` `variants`
  (`DashboardPage.tsx` is the reference implementation).
  Interactive elements (nav links, trip section tabs) use a single shared
  `layoutId` pill background instead of restyling per-item — it slides
  between selections.
- Respect `prefers-reduced-motion` — handled globally in `index.css`.

## Component notes

- **Button** (`Button.tsx`) is a thin `cva` wrapper around the
  `.btn-primary` / `.btn-secondary` / `.btn-tertiary` classes in
  `index.css` — style once there, not duplicated in the component.
- **Card** (`Card.tsx`) is the same relationship with `.card`. Clickable
  cards get keyboard support (`role="button"`, Enter/Space) for free.
- **Modal** (`Modal.tsx`) and dropdown panels use `.surface-panel` (a
  static raised surface) — never reuse `.card` for non-card containers,
  its hover-lift and top accent line are card-specific and look like a
  bug anywhere else.
- **Header/sidebar** use `.glass-surface` (translucent + backdrop-blur)
  instead of solid white/slate + heavy border-bottom.
