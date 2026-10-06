import React from 'react';

/** Racchetta da tennis nello stile delle icone Lucide (24x24, tratto 2): Lucide non ne ha una. */
export const TennisRacketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <ellipse cx="15" cy="9" rx="4.5" ry="6.5" transform="rotate(45 15 9)" />
    <path d="M10.4 13.6 4.5 19.5" />
    <path d="M4.5 19.5 3 21" />
    <path d="M11.5 12.5 18.5 5.5" />
    <path d="M12 6 18 12" />
  </svg>
);
