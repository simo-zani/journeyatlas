import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Globe,
  Map,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plane,
  Settings,
  Sun,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { EditProfileModal } from '@/components/EditProfileModal';
import { OverlayScrollbar } from '@/components/OverlayScrollbar';
import { useAuth } from '@/auth/AuthContext';
import { getTheme, setTheme } from '@/utils/theme';
import { flagUrl } from '@/lib/flags';
import { fetchProfile } from '@/lib/api';

const NAV_ITEMS = [
  { key: 'myTrips', to: '/', icon: Map },
];

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 68;
const SIDEBAR_STORAGE_KEY = 'ja-sidebar-collapsed';

const NavList: React.FC<{
  onNavigate?: () => void;
  isExpanded?: boolean;
}> = ({ onNavigate, isExpanded = true }) => {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col gap-1.5" aria-label="Main navigation">
      {NAV_ITEMS.map(({ key, to, icon: Icon }) => (
        <NavLink
          key={key}
          to={to}
          end={to === '/'}
          title={!isExpanded ? t(`nav.${key}`) : undefined}
          className={({ isActive }) =>
            `relative flex items-center h-11 rounded-xl font-semibold transition-colors duration-200 overflow-hidden no-underline hover:no-underline focus:no-underline ${
              isExpanded ? 'w-full' : 'w-[52px]'
            } ${
              isActive
                ? 'text-deep-blue dark:text-gold-light'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-900/5 dark:hover:bg-white/5'
            }`
          }
          onClick={onNavigate}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-xl bg-gold/15 ring-1 ring-gold/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <div className="w-[52px] h-11 flex items-center justify-center shrink-0 relative z-10">
                <Icon className="w-6 h-6" />
              </div>
              <motion.span
                className="relative z-10 text-sm select-none whitespace-nowrap overflow-hidden pr-3 font-semibold"
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  width: isExpanded ? 'auto' : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                {t(`nav.${key}`)}
              </motion.span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(getTheme() === 'dark');
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const isItalian = i18n.language?.startsWith('it');

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setUsername(null);
      return;
    }
    let cancelled = false;
    fetchProfile(user.id)
      .then((profile) => {
        if (!cancelled) {
          setAvatarUrl(profile?.avatar_url ?? null);
          setUsername(profile?.username ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvatarUrl(null);
          setUsername(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const avatarInitial = user?.email?.trim().charAt(0).toUpperCase() || '?';

  useEffect(() => {
    if (!settingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsContainerRef.current && !settingsContainerRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsOpen]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !sidebarCollapsed || isHovered;

  const toggleSidebar = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsHovered(false);
    setSettingsOpen(false);
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  };

  const toggleTheme = (theme: 'light' | 'dark') => {
    setTheme(theme);
    setIsDark(theme === 'dark');
  };

  const handleMobileLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden" style={{ backgroundColor: 'var(--surface-0)' }}>
      {/* ── Mobile top bar (md:hidden) ── */}
      <div className="md:hidden h-14 glass-surface border-b px-4 flex items-center justify-between shrink-0 z-30">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left"
          aria-label={t('common.appName', 'JourneyAtlas')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/30 via-gold/15 to-transparent ring-1 ring-gold/40 flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5 text-gold" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-deep-blue dark:text-slate-100">
            {t('common.appName', 'JourneyAtlas')}
          </span>
        </button>

        <button
          onClick={() => setSidebarOpen((open) => !open)}
          className="w-10 h-10 rounded-xl bg-slate-900/5 dark:bg-white/5 text-slate-700 dark:text-slate-200 flex items-center justify-center"
          aria-label={t('nav.openMenu')}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Desktop sidebar: 100% viewport height ── */}
      <div
        className="hidden md:block relative shrink-0 h-screen z-30"
        style={{
          width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={() => {
          if (sidebarCollapsed) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (sidebarCollapsed) {
            setSettingsOpen(false);
          }
        }}
      >
        <motion.aside
          className={`border-r overflow-hidden h-screen z-30 ${
            sidebarCollapsed && isHovered
              ? 'absolute top-0 bottom-0 left-0 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10'
              : 'relative'
          }`}
          style={{
            backgroundColor: 'var(--surface-0)',
            borderColor: 'var(--border-subtle)',
          }}
          animate={{
            width: isExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            {/* 1. Sidebar Header: Logo & App Name (lowered, no separator) */}
            <div className="pt-5 pb-2 shrink-0 flex items-center px-3.5 overflow-hidden">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 w-full text-left group cursor-pointer focus:outline-none"
                title={t('common.appName', 'JourneyAtlas')}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/30 via-gold/15 to-transparent ring-1 ring-gold/40 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <Plane className="w-6 h-6 text-gold" />
                </div>
                <motion.span
                  className="font-display font-bold text-lg tracking-tight text-deep-blue dark:text-slate-100 whitespace-nowrap overflow-hidden"
                  animate={{
                    opacity: isExpanded ? 1 : 0,
                    width: isExpanded ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {t('common.appName', 'JourneyAtlas')}
                </motion.span>
              </button>
            </div>

            {/* 2. Navigation items */}
            <div className="p-2 flex-1 overflow-y-auto overflow-x-hidden">
              <NavList isExpanded={isExpanded} />
            </div>

            {/* 3. Bottom controls: Upward-expanding Settings + Sidebar toggle (no separator lines) */}
            <div className="shrink-0 flex flex-col p-2" ref={settingsContainerRef}>
              <div
                className={`rounded-xl transition-all duration-300 overflow-hidden ${
                  settingsOpen && isExpanded
                    ? 'bg-slate-900/60 dark:bg-white/[0.06] ring-1 ring-gold/40 shadow-xl'
                    : 'hover:bg-slate-900/5 dark:hover:bg-white/5'
                }`}
              >
                {/* Upwards expanding settings panel */}
                <AnimatePresence initial={false}>
                  {settingsOpen && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="p-3.5 pb-2 space-y-3.5 text-xs">
                        {/* 1. Lingua Section - Left-aligned header with 100% white text */}
                        <div>
                          <div className="flex items-center justify-start gap-1.5 px-0.5 font-bold uppercase tracking-wider text-[11px] mb-2 text-white">
                            <Globe className="w-3.5 h-3.5 text-gold" />
                            <span>{isItalian ? 'Lingua' : 'Language'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/10 dark:bg-black/30 border border-slate-200/30 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => i18n.changeLanguage('it')}
                              className={`py-1.5 px-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isItalian
                                  ? 'bg-white dark:bg-slate-800 text-deep-blue dark:text-gold-light shadow-sm ring-1 ring-gold/30 font-bold'
                                  : 'text-white hover:text-white/80'
                              }`}
                            >
                              <img src={flagUrl('it')} alt="" className="w-5 h-3.5 rounded-xl object-cover shadow-sm shrink-0" />
                              <span>{isItalian ? 'Italiano' : 'Italian'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => i18n.changeLanguage('en')}
                              className={`py-1.5 px-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                !isItalian
                                  ? 'bg-white dark:bg-slate-800 text-deep-blue dark:text-gold-light shadow-sm ring-1 ring-gold/30 font-bold'
                                  : 'text-white hover:text-white/80'
                              }`}
                            >
                              <img src={flagUrl('us')} alt="" className="w-5 h-3.5 rounded-xl object-cover shadow-sm shrink-0" />
                              <span>{isItalian ? 'Inglese' : 'English'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. Tema Section - Left-aligned header with 100% white text */}
                        <div>
                          <div className="flex items-center justify-start gap-1.5 px-0.5 font-bold uppercase tracking-wider text-[11px] mb-2 text-white">
                            <Palette className="w-3.5 h-3.5 text-gold" />
                            <span>{isItalian ? 'Cambia tema' : 'Change theme'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/10 dark:bg-black/30 border border-slate-200/30 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => toggleTheme('light')}
                              className={`py-1.5 px-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                !isDark
                                  ? 'bg-white dark:bg-slate-800 text-deep-blue dark:text-gold-light shadow-sm ring-1 ring-gold/30 font-bold'
                                  : 'text-white hover:text-white/80'
                              }`}
                            >
                              <Sun className="w-3.5 h-3.5 text-gold" />
                              <span>{isItalian ? 'Chiaro' : 'Light'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleTheme('dark')}
                              className={`py-1.5 px-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isDark
                                  ? 'bg-white dark:bg-slate-800 text-deep-blue dark:text-gold-light shadow-sm ring-1 ring-gold/30 font-bold'
                                  : 'text-white hover:text-white/80'
                              }`}
                            >
                              <Moon className="w-3.5 h-3.5 text-gold" />
                              <span>{isItalian ? 'Scuro' : 'Dark'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 3. Account & Logout */}
                        {user && (
                          <div className="space-y-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setProfileModalOpen(true)}
                              className="flex items-center gap-2.5 px-1 py-1 w-full text-left rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                              title={t('profile.title')}
                            >
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/40 shrink-0 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold ring-2 ring-gold/40 shrink-0 shadow-sm">
                                  {avatarInitial}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-white font-medium truncate">
                                  {user.email}
                                </p>
                              </div>
                            </button>

                            <Button
                              variant="tertiary"
                              size="sm"
                              className="w-full justify-center !rounded-xl !bg-red-500/25 hover:!bg-red-500/35 !text-red-400 hover:!text-red-300 !border !border-red-500/40 font-bold transition-all"
                              onClick={handleMobileLogout}
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

                {/* Impostazioni Trigger Button at the bottom of the card */}
                <button
                  onClick={() => setSettingsOpen((open) => !open)}
                  aria-expanded={settingsOpen}
                  aria-label={isItalian ? 'Impostazioni' : 'Settings'}
                  title={!isExpanded ? (isItalian ? 'Impostazioni' : 'Settings') : undefined}
                  className={`relative flex items-center h-11 rounded-xl font-semibold transition-colors duration-200 overflow-hidden cursor-pointer focus:outline-none ${
                    isExpanded ? 'w-full' : 'w-[52px]'
                  } ${
                    settingsOpen
                      ? 'text-white font-bold bg-gold/20 dark:bg-gold/15'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="w-[52px] h-11 flex items-center justify-center shrink-0 relative z-10">
                    <Settings className={`w-6 h-6 transition-transform duration-300 ${settingsOpen ? 'rotate-90 text-gold' : ''}`} />
                  </div>
                  <motion.span
                    className={`relative z-10 text-sm select-none whitespace-nowrap overflow-hidden pr-3 font-semibold text-left ${
                      settingsOpen ? 'text-white' : ''
                    }`}
                    animate={{
                      opacity: isExpanded ? 1 : 0,
                      width: isExpanded ? 'auto' : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {isItalian ? 'Impostazioni' : 'Settings'}
                  </motion.span>
                </button>
              </div>

              {/* Collapse/expand toggle: perfectly aligned with sidebar buttons in collapsed mode */}
              <div className="p-0 pt-1 shrink-0 flex items-center">
                <motion.button
                  layout
                  onClick={toggleSidebar}
                  aria-expanded={isExpanded}
                  aria-label={sidebarCollapsed ? t('nav.openSidebar') : t('nav.closeSidebar')}
                  title={sidebarCollapsed ? t('nav.openSidebar') : t('nav.closeSidebar')}
                  className={`h-11 rounded-xl text-slate-500 dark:text-slate-400 hover:text-deep-blue dark:hover:text-gold-light hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                    !sidebarCollapsed ? 'w-11 ml-auto' : 'w-[52px]'
                  }`}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="w-6 h-6" />
                  ) : (
                    <PanelLeftClose className="w-6 h-6" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* ── Mobile drawer with nav and settings ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            style={{ backgroundColor: 'var(--overlay)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              className="absolute inset-y-0 left-0 w-72 surface-panel rounded-none p-4 flex flex-col justify-between"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-200/60 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/30 to-gold/10 ring-1 ring-gold/40 flex items-center justify-center">
                      <Plane className="w-4 h-4 text-gold" />
                    </div>
                    <span className="font-display font-bold text-base text-deep-blue dark:text-slate-100">
                      {t('common.appName', 'JourneyAtlas')}
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={t('common.close', 'Chiudi')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <NavList onNavigate={() => setSidebarOpen(false)} />
              </div>

              {/* Mobile Drawer Footer: Settings */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('nav.settings', 'Impostazioni')}
                </p>

                {/* Language Switch */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Globe className="w-3.5 h-3.5 text-gold" /> Lingua
                  </span>
                  <div className="flex gap-1 p-0.5 rounded-lg bg-slate-900/5 dark:bg-white/5">
                    <Button
                      variant={i18n.language?.startsWith('it') ? 'primary' : 'tertiary'}
                      size="sm"
                      className="!py-1 !px-2.5 !text-xs"
                      onClick={() => i18n.changeLanguage('it')}
                    >
                      IT
                    </Button>
                    <Button
                      variant={i18n.language?.startsWith('en') ? 'primary' : 'tertiary'}
                      size="sm"
                      className="!py-1 !px-2.5 !text-xs"
                      onClick={() => i18n.changeLanguage('en')}
                    >
                      EN
                    </Button>
                  </div>
                </div>

                {/* Theme Switch */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Sun className="w-3.5 h-3.5 text-gold" /> {t('nav.theme', 'Tema')}
                  </span>
                  <div className="flex gap-1 p-0.5 rounded-lg bg-slate-900/5 dark:bg-white/5">
                    <Button
                      variant={!isDark ? 'primary' : 'tertiary'}
                      size="sm"
                      className="!py-1 !px-2.5 !text-xs"
                      onClick={() => toggleTheme('light')}
                    >
                      <Sun className="w-3.5 h-3.5 mr-1 text-gold" /> Light
                    </Button>
                    <Button
                      variant={isDark ? 'primary' : 'tertiary'}
                      size="sm"
                      className="!py-1 !px-2.5 !text-xs"
                      onClick={() => toggleTheme('dark')}
                    >
                      <Moon className="w-3.5 h-3.5 mr-1" /> Dark
                    </Button>
                  </div>
                </div>

                {/* Profile & Logout */}
                {user && (
                  <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setSidebarOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="flex items-center gap-2 mb-2 cursor-pointer"
                      title={t('profile.title')}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                          {avatarInitial}
                        </div>
                      )}
                      <span className="text-xs text-slate-400 truncate">{user.email}</span>
                    </button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="w-full justify-center !text-red-500 hover:!bg-red-500/10 !border-red-500/20"
                      onClick={handleMobileLogout}
                      disabled={loggingOut}
                    >
                      {loggingOut && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                      {t('nav.logout', 'Esci')}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content area ──
          OverlayScrollbar lives in this non-scrolling wrapper, as a sibling
          of <main> rather than a child of it — a child anchored with
          position:absolute would be part of <main>'s own scrollable content
          and scroll away with it instead of staying pinned to the visible
          viewport while tracking scroll progress. */}
      <div className="relative flex-1 min-w-0 h-full">
        <main
          ref={mainRef}
          className="h-full overflow-y-auto overflow-x-hidden scroll-overlay-host"
          style={{ padding: 'clamp(16px, 2.5vw, 40px) clamp(16px, 2.5vw, 48px)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <OverlayScrollbar targetRef={mainRef} />
      </div>

      {user && (
        <EditProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          userId={user.id}
          currentAvatarUrl={avatarUrl}
          currentUsername={username}
          onSaved={(next) => {
            setAvatarUrl(next.avatarUrl);
            setUsername(next.username);
          }}
        />
      )}
    </div>
  );
};