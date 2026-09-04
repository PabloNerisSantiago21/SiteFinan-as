import { useState, type FormEvent } from 'react';
import { Button, ErrorBanner, Input, Modal } from './ui';
import { api, ApiError } from '../lib/api';
import type { Category } from '../types';

const COLOR_OPTIONS = ['#2fbf8f', '#e8604b', '#f2b84b', '#6ea8fe', '#c084fc', '#f472b6', '#8792a8'];

export function CategoryModal({
  open,
  onClose,
  onSaved,
  category,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  category?: Category | null;
}) {
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<Category['type']>(category?.type ?? 'expense');
  const [color, setColor] = useState(category?.color ?? COLOR_OPTIONS[0]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { name, type, color };
      if (isEdit && category) {
        await api.put(`/categories/${category.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a categoria.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar categoria' : 'Nova categoria'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Alimentação, Salário" />

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-muted">Tipo</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                type === 'expense' ? 'border-expense bg-expense-soft text-expense' : 'border-border text-text-muted'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                type === 'income' ? 'border-income bg-income-soft text-income' : 'border-border text-text-muted'
              }`}
            >
              Receita
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-muted">Cor</span>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Cor ${c}`}
                className="h-7 w-7 rounded-full transition-transform"
                style={{ backgroundColor: c, outline: color === c ? '2px solid var(--color-text)' : 'none', outlineOffset: 2 }}
              />
            ))}
          </div>
        </div>

        <ErrorBanner message={error} />
        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? 'Salvando…' : 'Salvar categoria'}
        </Button>
      </form>
    </Modal>
  );
}
