import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Menu, X } from 'lucide-react';
import { Header } from '@/components/Header';

const NAV_ITEMS = [
  { key: 'dashboard', to: '/', icon: LayoutDashboard },
  { key: 'myTrips', to: '/trips', icon: Map },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarContent = (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_ITEMS.map(({ key, to, icon: Icon }) => (
        <NavLink
          key={key}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors min-h-[44px] ${
              isActive
                ? 'bg-deep-blue text-white border-l-4 border-gold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-l-4 border-transparent'
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <Icon className="w-5 h-5" />
          {t(`nav.${key}`)}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-navy flex flex-col transition-colors">
      <Header onNavigateHome={() => navigate('/')} />

      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <button
          className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-lg bg-deep-blue text-white border-2 border-gold shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Navigation"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          {sidebarContent}
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
              {sidebarContent}
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};