import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, User, Loader2, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/Button';
import { getTheme, setTheme } from '@/utils/theme';
import { useAuth } from '@/auth/AuthContext';

interface SettingsPopoverProps {
  open: boolean;
  onClose: () => void;
  isSidebarCollapsed: boolean;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  open,
  onClose,
  isSidebarCollapsed,
  anchorRef,
}) => {
  const { i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(getTheme() === 'dark');
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target as Node))
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  const toggleTheme = (theme: 'light' | 'dark') => {
    setTheme(theme);
    setIsDark(theme === 'dark');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    onClose();
  };

  const switchLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const isItalian = i18n.language?.startsWith('it');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`surface-panel absolute z-50 p-4 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 w-72 rounded-2xl ${
            isSidebarCollapsed
              ? 'left-[76px] bottom-12 origin-bottom-left'
              : 'left-3 right-3 bottom-14 origin-bottom'
          }`}
          style={{ width: isSidebarCollapsed ? '280px' : 'calc(100% - 24px)' }}
        >
          <div className="space-y-4 text-xs">
            {/* 1. Language switcher */}
            <div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold mb-2">
                <Globe className="w-3.5 h-3.5 text-gold" />
                <span>{isItalian ? 'Lingua' : 'Language'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => switchLanguage('it')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                    isItalian
                      ? 'bg-white dark:bg-slate-800 text-deep-blue dark:text-gold-light shadow-sm ring-1 ring-gold/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Italiano (IT)
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguage('en')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center ${
                    !isItalian
                      ? 'bg-white dark:bg-slate-800 text-deep-blue dark:text-gold-light shadow-sm ring-1 ring-gold/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {/* 2. Theme switcher */}
            <div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold mb-2">
                <Palette className="w-3.5 h-3.5 text-gold" />
                <span>{isItalian ? 'Cambia tema' : 'Change theme'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => toggleTheme('light')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !isDark
                      ? 'bg-white dark:bg-slate-800 text-deep-blue dark:text-gold-light shadow-sm ring-1 ring-gold/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-gold" />
                  <span>{isItalian ? 'Chiaro' : 'Light mode'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleTheme('dark')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-white dark:bg-slate-800 text-deep-blue dark:text-gold-light shadow-sm ring-1 ring-gold/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-gold" />
                  <span>{isItalian ? 'Scuro' : 'Dark mode'}</span>
                </button>
              </div>
            </div>

            {/* 3. Account & Logout */}
            {user && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2.5 mb-2.5 px-1">
                  <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold ring-1 ring-gold/30 shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1 flex items-center">
                    <p className="text-xs text-slate-300 font-medium truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Button
                  variant="tertiary"
                  size="sm"
                  className="w-full justify-center !text-red-500 hover:!bg-red-500/10 !border-red-500/20 font-semibold"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                  {isItalian ? 'Esci' : 'Log out'}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
