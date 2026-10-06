import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: string;
  /** Variante "alta": pannello più alto (95vh) e senza scroll verticale. */
  tall?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, maxWidth = 'max-w-3xl', tall = false, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // All'apertura il focus va al pannello, non al primo campo: così nessun campo
  // (es. la città, che apre subito l'elenco delle mete) si attiva da solo.
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Portale su <body>: dentro il contenuto della pagina (che ha una transform di
  // animazione) `fixed` non è relativo alla finestra e l'overlay si fermava a metà.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className={`outline-none surface-panel w-full ${maxWidth} ${tall ? 'max-h-[95vh] overflow-hidden' : 'max-h-[90vh] overflow-y-auto'}`}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h3>{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
