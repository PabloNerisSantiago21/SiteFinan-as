import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, ErrorBanner, Input } from '../components/ui';
import { ApiError } from '../lib/api';

export function Register() {
  const { user, loading, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register(name, email, password);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          setFieldErrors(Object.fromEntries(err.details.map((d) => [d.path, d.message])));
        }
      } else {
        setError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl text-text">Extrato</p>
          <p className="mt-1 text-sm text-text-muted">Crie sua conta e comece a organizar suas finanças</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          <Input
            label="Nome"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <ErrorBanner message={error && !Object.keys(fieldErrors).length ? error : ''} />
          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? 'Criando conta…' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-text-muted">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
