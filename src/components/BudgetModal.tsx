import { useState, type FormEvent } from 'react';
import { Button, ErrorBanner, Modal, MoneyInput, Select } from './ui';
import { api, ApiError } from '../lib/api';
import type { Budget, Category } from '../types';

export function BudgetModal({
  open,
  onClose,
  onSaved,
  categories,
  period,
  budget,
  usedCategoryIds,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
  period: string;
  budget?: Budget | null;
  usedCategoryIds: number[];
}) {
  const isEdit = Boolean(budget);
  const [categoryId, setCategoryId] = useState(String(budget?.category_id ?? ''));
  const [amount, setAmount] = useState<number | null>(budget?.amount ?? null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ao criar, esconde categorias que já têm meta neste mês — evita o erro antes dele acontecer
  const available = categories.filter(
    (c) => c.type === 'expense' && (isEdit || !usedCategoryIds.includes(c.id))
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('Escolha uma categoria.');
      return;
    }
    if (amount === null || amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && budget) {
        await api.put(`/budgets/${budget.id}`, { amount });
      } else {
        await api.post('/budgets', { category_id: Number(categoryId), amount, period });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a meta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar meta' : 'Nova meta'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isEdit ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-ink px-3 py-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: budget!.category_color }} />
            <span className="text-sm text-text">{budget!.category_name}</span>
          </div>
        ) : (
          <Select label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Selecione…</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}

        <MoneyInput label="Limite do mês" cents={amount} onChangeCents={setAmount} required placeholder="0,00" />

        {!isEdit && available.length === 0 && (
          <p className="text-sm text-text-muted">
            Todas as categorias de despesa já têm meta neste mês. Crie uma nova categoria ou edite uma meta existente.
          </p>
        )}

        <ErrorBanner message={error} />
        <Button type="submit" disabled={submitting || (!isEdit && available.length === 0)} className="mt-2 w-full">
          {submitting ? 'Salvando…' : 'Salvar meta'}
        </Button>
      </form>
    </Modal>
  );
}
