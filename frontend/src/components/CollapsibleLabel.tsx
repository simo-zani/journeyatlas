import React from 'react';
import { motion } from 'framer-motion';

/** Etichetta che si richiude fino a scomparire (solo icona) con transizione fluida. */
export const CollapsibleLabel: React.FC<{ compact: boolean; children: React.ReactNode }> = ({ compact, children }) => (
  <motion.span
    initial={false}
    className="overflow-hidden whitespace-nowrap"
    animate={{ width: compact ? 0 : 'auto', opacity: compact ? 0 : 1, marginLeft: compact ? 0 : 8 }}
    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.span>
);
