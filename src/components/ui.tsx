import { type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { centsToInput, inputToCents } from '../lib/format';

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary: 'bg-accent text-ink hover:brightness-110',
    ghost: 'bg-transparent text-text border border-border hover:bg-surface-alt',
    danger: 'bg-transparent text-expense border border-expense/40 hover:bg-expense-soft',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Input({ label, error, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-text-muted">{label}</span>}
      <input
        className={`rounded-md border border-border bg-ink px-3 py-2 text-text placeholder:text-text-muted/60 focus:border-accent outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-expense">{error}</span>}
    </label>
  );
}

export function Select({
  label,
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-text-muted">{label}</span>}
      <select
        className={`rounded-md border border-border bg-ink px-3 py-2 text-text focus:border-accent outline-none transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

/**
 * Campo de valor monetário. O usuário digita em reais ("45,90"), mas o
 * componente entrega e recebe SEMPRE centavos inteiros — a conversão fica
 * contida aqui, em vez de espalhada pelos formulários.
 */
export function MoneyInput({
  label,
  cents,
  onChangeCents,
  error,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  label?: string;
  cents: number | null;
  onChangeCents: (cents: number | null) => void;
  error?: string;
}) {
  const [text, setText] = useState(cents === null ? '' : centsToInput(cents));

  function handleChange(raw: string) {
    setText(raw);
    onChangeCents(raw.trim() === '' ? null : inputToCents(raw));
  }

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-text-muted">{label}</span>}
      <div className="flex items-center rounded-md border border-border bg-ink focus-within:border-accent transition-colors">
        <span className="pl-3 text-sm text-text-muted">R$</span>
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => {
            const parsed = inputToCents(text);
            if (parsed !== null) setText(centsToInput(parsed));
          }}
          className="money w-full bg-transparent px-2 py-2 text-text placeholder:text-text-muted/60 outline-none"
          {...props}
        />
      </div>
      {error && <span className="text-xs text-expense">{error}</span>}
    </label>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-surface p-5 ${className}`}>{children}</div>;
}

export function Stamp({ type, children }: { type: 'income' | 'expense' | 'neutral'; children: ReactNode }) {
  const colors: Record<string, string> = {
    income: 'text-income',
    expense: 'text-expense',
    neutral: 'text-accent',
  };
  return <span className={`stamp ${colors[type]}`}>{children}</span>;
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-14 text-center">
      <p className="font-display text-lg text-text">{title}</p>
      {hint && <p className="max-w-sm text-sm text-text-muted">{hint}</p>}
      {action}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-text">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-text-muted hover:bg-surface-alt hover:text-text"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-expense/40 bg-expense-soft px-3 py-2 text-sm text-expense">{message}</div>
  );
}
