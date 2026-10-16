import React from 'react';

type IconProps = { className?: string; strokeWidth?: number };

/** Contenitore SVG nello stile delle icone Lucide (24x24, tratto arrotondato). */
const LucideLike: React.FC<IconProps & { children: React.ReactNode }> = ({ className, strokeWidth = 2, children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** Muso di mucca con corna e orecchie: Lucide ha solo la bistecca (Beef). */
export const CowIcon: React.FC<IconProps> = (props) => (
  <LucideLike {...props}>
    <path d="M7 6.5C6 5.5 5.5 4.5 5.5 3" />
    <path d="M17 6.5c1-1 1.5-2 1.5-3.5" />
    <path d="M7.5 9 3 8.5c0 1.5 1.5 2.5 4.5 2.5" />
    <path d="M16.5 9 21 8.5c0 1.5-1.5 2.5-4.5 2.5" />
    <path d="M7.5 13.5V9a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v4.5" />
    <rect x="6" y="13" width="12" height="8" rx="4" />
    <path d="M10 10.5h.01" />
    <path d="M14 10.5h.01" />
    <path d="M10 17h.01" />
    <path d="M14 17h.01" />
  </LucideLike>
);

/** Muso di maiale con orecchie e grugno: Lucide ha solo il prosciutto (Ham) e il salvadanaio. */
export const PigIcon: React.FC<IconProps> = (props) => (
  <LucideLike {...props}>
    <path d="M6.5 8.5C4.5 8 3 6 3 3c2.5 0 4.5 1 6 3" />
    <path d="M17.5 8.5C19.5 8 21 6 21 3c-2.5 0-4.5 1-6 3" />
    <circle cx="12" cy="13.5" r="7.5" />
    <ellipse cx="12" cy="15.5" rx="4" ry="2.75" />
    <path d="M10.5 15.5h.01" />
    <path d="M13.5 15.5h.01" />
    <path d="M9 11h.01" />
    <path d="M15 11h.01" />
  </LucideLike>
);
