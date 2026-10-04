import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/primitives';
import api, { errorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse } from '@/types/api';

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 pb-[calc(2rem+var(--safe-bottom))] pt-[calc(2rem+var(--safe-top))]">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-12 w-12" />
          <span className="font-display text-3xl font-semibold">VitaTrack</span>
        </div>
        <h1 className="text-[40px] leading-none">{title}</h1>
        <p className="mb-8 mt-2 text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('auth/login', { email, password });
      setAuth(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Email or password is incorrect.'));
    } finally {
      setBusy(false);
    }
  };

  const loginDemo = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('auth/login', { email: 'demo@vitatrack.com', password: 'Password123!' });
      setAuth(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not log in with demo account.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Log in" subtitle="Pick up where you left off.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><Input type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {error && <p className="rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Log in</Button>
      </form>
      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
        <span className="relative bg-background px-3 text-xs uppercase tracking-wider text-muted">or</span>
      </div>
      <Button type="button" variant="secondary" size="lg" className="w-full" onClick={loginDemo} loading={busy}>
        Explore with Demo User
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        Demo credentials: <span className="font-mono text-foreground">demo@vitatrack.com</span> / <span className="font-mono text-foreground">Password123!</span>
      </p>
      <p className="mt-6 text-center text-muted">
        New here? <Link to="/register" className="font-semibold text-primary">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('auth/register', form);
      setAuth(data);
      navigate('/settings?welcome=1', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Log workouts, food and weight in one place.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name"><Input autoComplete="given-name" required value={form.name} onChange={set('name')} /></Field>
        <Field label="Email"><Input type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={set('email')} /></Field>
        <Field label="Password" hint="At least 8 characters"><Input type="password" autoComplete="new-password" required value={form.password} onChange={set('password')} /></Field>
        {error && <p className="rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-muted">
        Already have an account? <Link to="/login" className="font-semibold text-primary">Log in</Link>
      </p>
    </AuthLayout>
  );
}
