import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, ErrorBanner, Input } from '../components/ui';
import { ApiError } from '../lib/api';

export function Login() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl text-text">Extrato</p>
          <p className="mt-1 text-sm text-text-muted">Entre para ver o seu controle financeiro</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ErrorBanner message={error} />
          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-text-muted">
          Ainda não tem conta?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
