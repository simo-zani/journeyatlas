import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Plane } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { useAuth } from '@/auth/AuthContext';
import { checkUsernameAvailable } from '@/lib/api';

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

export const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      setError(t('auth.errors.usernameInvalid'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      return;
    }

    setSubmitting(true);
    try {
      const available = await checkUsernameAvailable(trimmedUsername);
      if (!available) {
        setError(t('auth.errors.usernameTaken'));
        return;
      }
      const { error: authError } = await signUp(email, password, trimmedUsername);
      if (authError) {
        setError(authError);
        return;
      }
      navigate('/', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-0)' }}
    >
      <div
        className="pointer-events-none absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, #D4AF37, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #003366, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Plane className="w-9 h-9 text-gold mx-auto mb-3" />
          <h1 className="mb-1 text-3xl sm:text-4xl">{t('auth.signup.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {t('auth.signup.subtitle')}
          </p>
        </div>

        <AnimatePresence>
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label={t('auth.username')}
            value={username}
            // Filtered live rather than only validated on submit: '@', spaces
            // and other characters are simply never accepted into the field.
            onChange={(e) => setUsername(e.target.value.replace(/[^A-Za-z0-9_.-]/g, ''))}
            required
            autoComplete="username"
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label={t('auth.confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <div className="pt-6">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {t('auth.signup.submit')}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm mt-4 text-slate-600 dark:text-slate-400">
          {t('auth.signup.hasAccount')}{' '}
          <Link to="/login">{t('auth.login.title')}</Link>
        </p>
      </motion.div>
    </div>
  );
};
