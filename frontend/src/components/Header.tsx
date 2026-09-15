import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, Plane, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { getTheme, setTheme } from '@/utils/theme';
import { useAuth } from '@/auth/AuthContext';

interface HeaderProps {
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(getTheme() === 'dark');
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
  };

  const switchLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="glass-surface border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
          aria-label={t('common.appName')}
        >
          <Plane className="w-6 h-6 text-gold" />
          <span className="font-display font-semibold text-xl tracking-tight text-deep-blue dark:text-slate-50">
            {t('common.appName')}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-0.5 rounded-lg bg-slate-900/5 dark:bg-white/5" role="group" aria-label="Language">
            <Button
              variant={i18n.language?.startsWith('it') ? 'primary' : 'tertiary'}
              size="sm"
              className={i18n.language?.startsWith('it') ? '' : '!bg-transparent'}
              onClick={() => switchLanguage('it')}
            >
              IT
            </Button>
            <Button
              variant={i18n.language?.startsWith('en') ? 'primary' : 'tertiary'}
              size="sm"
              className={i18n.language?.startsWith('en') ? '' : '!bg-transparent'}
              onClick={() => switchLanguage('en')}
            >
              EN
            </Button>
          </div>

          <Button
            variant="tertiary"
            size="sm"
            onClick={toggleTheme}
            title={t('nav.theme')}
            aria-label={t('nav.theme')}
            className="overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex"
              >
                {isDark ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </Button>

          {user && (
            <div className="relative" ref={menuRef}>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label={t('nav.profile')}
                aria-expanded={profileOpen}
              >
                <User className="w-5 h-5" />
              </Button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="surface-panel absolute right-0 top-full mt-2 w-64 origin-top-right"
                  >
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {t('nav.profile')}
                      </p>
                      {user.email && (
                        <p className="text-sm text-slate-700 dark:text-slate-200 break-all mt-1">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <div className="p-2">
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="w-full justify-start"
                        onClick={handleLogout}
                        disabled={loggingOut}
                      >
                        {loggingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                        {t('nav.logout')}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
