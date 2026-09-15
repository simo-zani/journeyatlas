import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Map, Menu, X } from 'lucide-react';
import { Header } from '@/components/Header';

const NAV_ITEMS = [
  { key: 'dashboard', to: '/', icon: LayoutDashboard },
  { key: 'myTrips', to: '/trips', icon: Map },
];

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
            `relative flex items-center gap-3 px-4 py-3 rounded-lg font-semibold min-h-[44px] transition-colors duration-200 ${
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-0)' }}>
      <Header onNavigateHome={() => navigate('/')} />

      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <motion.button
          className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-deep-blue text-white shadow-glow-gold ring-1 ring-gold/60 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Navigation"
          whileTap={{ scale: 0.92 }}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>

        {/* Desktop sidebar */}
        <aside
          className="hidden md:block w-64 shrink-0 p-4 glass-surface border-r"
        >
          <NavList />
        </aside>

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
