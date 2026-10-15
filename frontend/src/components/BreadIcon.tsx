import React from 'react';

/** Pagnotta con i tagli sulla crosta, nello stile delle icone Lucide (24x24): Lucide ha solo il croissant. */
export const BreadIcon: React.FC<{ className?: string; strokeWidth?: number }> = ({ className, strokeWidth = 2 }) => (
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
    <path d="M4 18h16a1 1 0 0 0 1-1c0-5.5-4-9.5-9-9.5S3 11.5 3 17a1 1 0 0 0 1 1Z" />
    <path d="M7.5 14.5 9 11" />
    <path d="M11 14.5 12.5 10.5" />
    <path d="M14.5 14.5 16 11.5" />
  </svg>
);
