import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Plane } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { useAuth } from '@/auth/AuthContext';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: authError } = await signIn(email, password);
    setSubmitting(false);
    if (authError) {
      setError(authError);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-navy flex items-center justify-center p-6 transition-colors">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <Plane className="w-10 h-10 text-deep-blue dark:text-gold mx-auto mb-2" />
          <h1 className="mb-1">{t('common.appName')}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {t('auth.login.subtitle')}
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('auth.login.submit')}
          </Button>
        </form>

        <p className="text-center text-sm mt-4 text-slate-600 dark:text-slate-400">
          {t('auth.login.noAccount')}{' '}
          <Link to="/signup">{t('auth.signup.title')}</Link>
        </p>
      </Card>
    </div>
  );
};