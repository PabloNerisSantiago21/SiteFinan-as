import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Account } from '../types';
import { Button, EmptyState, ErrorBanner, PageLoader } from '../components/ui';
import { AccountCard } from '../components/AccountCard';
import { AccountModal } from '../components/AccountModal';

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ accounts: Account[] }>('/accounts');
      setAccounts(res.accounts);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as contas.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(account: Account) {
    if (!confirm(`Excluir a conta "${account.name}"? Todas as transações ligadas a ela também serão apagadas.`)) return;
    try {
      await api.delete(`/accounts/${account.id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível excluir a conta.');
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(account: Account) {
    setEditing(account);
    setModalOpen(true);
  }

  if (accounts === null) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-2xl text-text">Contas</p>
          <p className="text-sm text-text-muted">Carteiras, contas correntes, poupanças e cartões</p>
        </div>
        <Button onClick={openNew}>+ Nova conta</Button>
      </div>

      <ErrorBanner message={error} />

      {accounts.length === 0 ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          hint="Crie sua primeira conta para começar a lançar receitas e despesas."
          action={<Button onClick={openNew}>+ Nova conta</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} onEdit={() => openEdit(a)} onDelete={() => handleDelete(a)} />
          ))}
        </div>
      )}

      {modalOpen && (
        <AccountModal open onClose={() => setModalOpen(false)} onSaved={load} account={editing} />
      )}
    </div>
  );
}
