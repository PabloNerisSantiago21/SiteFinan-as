import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Account, Category, Transaction } from '../types';
import { Button, EmptyState, ErrorBanner, PageLoader, Select } from '../components/ui';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionRow } from '../components/TransactionRow';
import { formatDateLong } from '../lib/format';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function Transactions() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [accountFilter, setAccountFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  useEffect(() => {
    Promise.all([api.get<{ accounts: Account[] }>('/accounts'), api.get<{ categories: Category[] }>('/categories')])
      .then(([accRes, catRes]) => {
        setAccounts(accRes.accounts);
        setCategories(catRes.categories);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar dados auxiliares.'));
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (accountFilter) params.set('account_id', accountFilter);
      if (typeFilter) params.set('type', typeFilter);
      const res = await api.get<{ transactions: Transaction[]; pagination: Pagination }>(`/transactions?${params}`);
      setTransactions(res.transactions);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as transações.');
    }
  }, [page, accountFilter, typeFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function handleDelete(tx: Transaction) {
    if (!confirm('Excluir esta transação?')) return;
    try {
      await api.delete(`/transactions/${tx.id}`);
      loadTransactions();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível excluir a transação.');
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setModalOpen(true);
  }

  // Agrupa por data para o visual de extrato
  const grouped: Array<{ date: string; items: Transaction[] }> = [];
  for (const tx of transactions ?? []) {
    const last = grouped[grouped.length - 1];
    if (last && last.date === tx.date) last.items.push(tx);
    else grouped.push({ date: tx.date, items: [tx] });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl text-text">Transações</p>
          <p className="text-sm text-text-muted">Todos os seus lançamentos, como um extrato</p>
        </div>
        <Button onClick={openNew} disabled={accounts.length === 0}>
          + Nova transação
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={accountFilter}
          onChange={(e) => { setAccountFilter(e.target.value); setPage(1); }}
          className="w-48"
        >
          <option value="">Todas as contas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="w-40"
        >
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </Select>
      </div>

      <ErrorBanner message={error} />

      {transactions === null ? (
        <PageLoader />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Nenhuma transação encontrada"
          hint={accounts.length === 0 ? 'Cadastre uma conta primeiro.' : 'Lance sua primeira receita ou despesa.'}
          action={
            <Button onClick={openNew} disabled={accounts.length === 0}>
              + Nova transação
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((group) => (
            <div key={group.date}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
                {formatDateLong(group.date)}
              </p>
              <div className="rounded-lg border border-border bg-surface px-4">
                {group.items.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onEdit={() => openEdit(tx)} onDelete={() => handleDelete(tx)} />
                ))}
              </div>
            </div>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="disabled:opacity-30 hover:text-text"
              >
                ← Anterior
              </button>
              <span>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="disabled:opacity-30 hover:text-text"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <TransactionModal
          open
          onClose={() => setModalOpen(false)}
          onSaved={loadTransactions}
          accounts={accounts}
          categories={categories}
          transaction={editing}
        />
      )}
    </div>
  );
}
