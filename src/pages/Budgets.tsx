import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { Budget, Category } from '../types';
import { Button, Card, EmptyState, ErrorBanner, PageLoader, Select } from '../components/ui';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetModal } from '../components/BudgetModal';
import { currentPeriod, formatMoney, formatPeriod } from '../lib/format';

function recentPeriods(count = 12): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

export function Budgets() {
  const [period, setPeriod] = useState(currentPeriod());
  const [budgets, setBudgets] = useState<Budget[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>('/categories?type=expense')
      .then((res) => setCategories(res.categories))
      .catch(() => setError('Não foi possível carregar as categorias.'));
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ budgets: Budget[] }>(`/budgets?period=${period}`);
      setBudgets(res.budgets);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as metas.');
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(budget: Budget) {
    if (!confirm(`Excluir a meta de ${budget.category_name}?`)) return;
    try {
      await api.delete(`/budgets/${budget.id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível excluir a meta.');
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(budget: Budget) {
    setEditing(budget);
    setModalOpen(true);
  }

  if (budgets === null) return <PageLoader />;

  const totalPlanned = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
  const exceeded = budgets.filter((b) => b.progress > 100);
  const hasExpenseCategories = categories.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl text-text">Orçamentos</p>
          <p className="text-sm text-text-muted">Defina um limite de gasto por categoria</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-48 capitalize">
            {recentPeriods().map((p) => (
              <option key={p} value={p} className="capitalize">
                {formatPeriod(p)}
              </option>
            ))}
          </Select>
          <Button onClick={openNew} disabled={!hasExpenseCategories}>
            + Nova meta
          </Button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {!hasExpenseCategories ? (
        <EmptyState
          title="Crie categorias de despesa primeiro"
          hint="As metas são definidas por categoria, então você precisa de pelo menos uma."
          action={
            <Link to="/categorias">
              <Button>Ir para categorias</Button>
            </Link>
          }
        />
      ) : budgets.length === 0 ? (
        <EmptyState
          title="Nenhuma meta neste mês"
          hint="Defina um limite para uma categoria e acompanhe o quanto já foi consumido."
          action={<Button onClick={openNew}>+ Nova meta</Button>}
        />
      ) : (
        <>
          {/* Resumo do mês */}
          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-text-muted">Total planejado</span>
              <span className="money text-sm text-text-muted">
                <span className="text-lg font-medium text-text">{formatMoney(totalSpent)}</span> de{' '}
                {formatMoney(totalPlanned)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(overallProgress, 100)}%`,
                  backgroundColor:
                    overallProgress > 100
                      ? 'var(--color-expense)'
                      : overallProgress >= 80
                        ? 'var(--color-accent)'
                        : 'var(--color-income)',
                }}
              />
            </div>
            {exceeded.length > 0 && (
              <p className="text-sm text-expense">
                {exceeded.length === 1
                  ? `1 categoria passou do limite: ${exceeded[0].category_name}.`
                  : `${exceeded.length} categorias passaram do limite.`}
              </p>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => (
              <BudgetCard key={b.id} budget={b} onEdit={() => openEdit(b)} onDelete={() => handleDelete(b)} />
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <BudgetModal
          open
          onClose={() => setModalOpen(false)}
          onSaved={load}
          categories={categories}
          period={period}
          budget={editing}
          usedCategoryIds={budgets.map((b) => b.category_id)}
        />
      )}
    </div>
  );
}
