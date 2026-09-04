import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import { Card, EmptyState, ErrorBanner, PageLoader, Select, Spinner } from '../components/ui';
import { CategoryDonut, type CategoryTotal } from '../components/CategoryDonut';
import { MonthlyBars, type MonthTotals } from '../components/MonthlyBars';
import { currentPeriod, formatPeriod } from '../lib/format';

/** Últimos 12 períodos ('YYYY-MM'), do mês atual para trás. */
function recentPeriods(count = 12): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

export function Reports() {
  const [period, setPeriod] = useState(currentPeriod());
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categories, setCategories] = useState<CategoryTotal[] | null>(null);
  const [months, setMonths] = useState<MonthTotals[] | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await api.get<{ categories: CategoryTotal[] }>(`/reports/by-category?period=${period}&type=${type}`);
      setCategories(res.categories);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o relatório por categoria.');
    } finally {
      setLoadingCategories(false);
    }
  }, [period, type]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    api
      .get<{ months: MonthTotals[] }>('/reports/monthly?months=6')
      .then((res) => setMonths(res.months))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar a evolução mensal.'));
  }, []);

  if (months === null && categories === null) return <PageLoader />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-display text-2xl text-text">Relatórios</p>
        <p className="text-sm text-text-muted">Para onde seu dinheiro está indo</p>
      </div>

      <ErrorBanner message={error} />

      {/* Evolução mensal */}
      <section>
        <p className="mb-3 font-display text-lg text-text">Entradas e saídas por mês</p>
        <Card>
          {months === null ? (
            <div className="flex h-72 items-center justify-center">
              <Spinner />
            </div>
          ) : months.length === 0 ? (
            <EmptyState title="Sem histórico ainda" hint="Registre lançamentos para acompanhar sua evolução mês a mês." />
          ) : (
            <MonthlyBars data={months} />
          )}
        </Card>
      </section>

      {/* Por categoria */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-lg text-text">Por categoria</p>
          <div className="flex gap-2">
            <Select value={type} onChange={(e) => setType(e.target.value as 'expense' | 'income')} className="w-36">
              <option value="expense">Saídas</option>
              <option value="income">Entradas</option>
            </Select>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-48 capitalize">
              {recentPeriods().map((p) => (
                <option key={p} value={p} className="capitalize">
                  {formatPeriod(p)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Card>
          {loadingCategories || categories === null ? (
            <div className="flex h-56 items-center justify-center">
              <Spinner />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              title={`Nenhuma ${type === 'expense' ? 'saída' : 'entrada'} neste mês`}
              hint="Escolha outro período ou registre lançamentos com categoria."
            />
          ) : (
            <CategoryDonut data={categories} />
          )}
        </Card>
      </section>
    </div>
  );
}
