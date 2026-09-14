import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    <header className="bg-white dark:bg-slate-800 border-b-2 border-gold shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label={t('common.appName')}
        >
          <Plane className="w-7 h-7 text-deep-blue dark:text-gold" />
          <span className="font-poppins font-bold text-xl text-deep-blue dark:text-gold">
            {t('common.appName')}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex gap-1" role="group" aria-label="Language">
            <Button
              variant={i18n.language?.startsWith('it') ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => switchLanguage('it')}
            >
              IT
            </Button>
            <Button
              variant={i18n.language?.startsWith('en') ? 'primary' : 'tertiary'}
              size="sm"
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
          >
            {isDark ? <Sun className="w-6 h-6 text-gold" /> : <Moon className="w-6 h-6" />}
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

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};