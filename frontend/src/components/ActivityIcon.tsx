import React from 'react';
import { resolveActivityIcon } from '@/lib/activityIcons';

interface ActivityIconProps {
  icon: string | null | undefined;
  className?: string;
  /** Pixel font-size for the emoji glyph — pick roughly the same value as
   * the `w-N`/`h-N` box it sits in (see call sites). */
  size?: number;
}

/** Renders one activity icon (emoji) at a consistent size — single render
 * point so every call site stays in sync if the icon set ever changes. */
export const ActivityIcon: React.FC<ActivityIconProps> = ({ icon, className, size = 24 }) => (
  <span
    className={`inline-flex items-center justify-center leading-none ${className ?? ''}`}
    style={{ fontSize: size }}
    aria-hidden="true"
  >
    {resolveActivityIcon(icon)}
  </span>
);
