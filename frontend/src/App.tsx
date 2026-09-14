import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { getTheme, setTheme } from '@/utils/theme';

// Setup placeholder page: conferma che design system, dark mode e i18n
// sono cablati correttamente. Le funzionalità reali arrivano nelle fasi
// descritte in specifiche/TRAVEL_APP_PHASES.md.
export default function App() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = getTheme();
    setIsDark(theme === 'dark');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-navy transition-colors flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <h1 className="mb-2">✈️ {t('common.appName')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Project setup OK — Vite + React + TS + Tailwind + i18n
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Badge variant="gold">Setup</Badge>
          <Badge variant="info">{i18n.language.toUpperCase()}</Badge>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => i18n.changeLanguage('en')}>
            EN
          </Button>
          <Button variant="secondary" size="sm" onClick={() => i18n.changeLanguage('it')}>
            IT
          </Button>
          <Button variant="tertiary" size="sm" onClick={toggleTheme} title={t('nav.theme')}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
