import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { Header } from '@/components/Header';

const NAV_ITEMS = [
  { key: 'dashboard', to: '/', icon: LayoutDashboard },
  { key: 'myTrips', to: '/trips', icon: Map },
];

const SIDEBAR_WIDTH = 256;
const SIDEBAR_STORAGE_KEY = 'ja-sidebar-collapsed';

const NavList: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_ITEMS.map(({ key, to, icon: Icon }) => (
        <NavLink
          key={key}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-4 py-3 rounded-lg font-semibold min-h-[44px] whitespace-nowrap transition-colors duration-200 ${
              isActive
                ? 'text-deep-blue dark:text-gold-light'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`
          }
          onClick={onNavigate}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-lg bg-gold/15 ring-1 ring-gold/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="w-5 h-5 relative" />
              <span className="relative">{t(`nav.${key}`)}</span>
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
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-0)' }}>
      <Header onNavigateHome={() => navigate('/')} />

      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle */}
        <motion.button
          className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-deep-blue text-white shadow-glow-gold ring-1 ring-gold/60 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={t('nav.openMenu')}
          whileTap={{ scale: 0.92 }}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>

        {/* Desktop sidebar */}
        <div className="hidden md:flex relative shrink-0">
          <motion.aside
            className="glass-surface border-r overflow-hidden h-full"
            animate={{ width: sidebarCollapsed ? 0 : SIDEBAR_WIDTH }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden={sidebarCollapsed}
          >
            <div className="w-64 h-full flex flex-col">
              <div className="flex items-center justify-end px-4 pt-4 pb-2">
                <button
                  onClick={toggleSidebar}
                  aria-label={t('nav.closeSidebar')}
                  title={t('nav.closeSidebar')}
                  className="p-2 -mr-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-deep-blue dark:hover:text-gold-light hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </div>
              <div className="px-2 pb-4">
                <NavList />
              </div>
            </div>
          </motion.aside>

          <AnimatePresence>
            {sidebarCollapsed && (
              <motion.button
                className="fixed left-3 z-30 p-3 rounded-full bg-deep-blue text-white shadow-glow-gold ring-1 ring-gold/60 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                initial={{ opacity: 0, x: -8, top: 80 }}
                animate={{ opacity: 1, x: 0, top: 80 }}
                exit={{ opacity: 0, x: -8, top: 80 }}
                onClick={toggleSidebar}
                aria-label={t('nav.openSidebar')}
                title={t('nav.openSidebar')}
                whileTap={{ scale: 0.92 }}
              >
                <PanelLeftOpen className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile drawer */}
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
                className="absolute inset-y-0 left-0 w-64 surface-panel rounded-none p-4"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <NavList onNavigate={() => setSidebarOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 min-w-0 p-4 md:p-8">
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
      </div>
    </div>
  );
};