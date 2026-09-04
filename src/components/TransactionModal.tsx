import { useState, type FormEvent } from 'react';
import { Button, ErrorBanner, Input, Modal, MoneyInput, Select } from './ui';
import { api, ApiError } from '../lib/api';
import { todayISO } from '../lib/format';
import type { Account, Category, Transaction } from '../types';

export function TransactionModal({
  open,
  onClose,
  onSaved,
  accounts,
  categories,
  transaction,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  accounts: Account[];
  categories: Category[];
  transaction?: Transaction | null;
}) {
  const isEdit = Boolean(transaction);
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type ?? 'expense');
  const [accountId, setAccountId] = useState(String(transaction?.account_id ?? accounts[0]?.id ?? ''));
  const [categoryId, setCategoryId] = useState(String(transaction?.category_id ?? ''));
  const [amount, setAmount] = useState<number | null>(transaction?.amount ?? null);
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [date, setDate] = useState(transaction?.date ?? todayISO());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!accountId) {
      setError('Selecione uma conta.');
      return;
    }

    if (amount === null || amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        account_id: Number(accountId),
        category_id: categoryId ? Number(categoryId) : null,
        type,
        amount,
        description,
        date,
      };
      if (isEdit && transaction) {
        await api.put(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a transação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar transação' : 'Nova transação'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategoryId(''); }}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              type === 'expense' ? 'border-expense bg-expense-soft text-expense' : 'border-border text-text-muted'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategoryId(''); }}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              type === 'income' ? 'border-income bg-income-soft text-income' : 'border-border text-text-muted'
            }`}
          >
            Receita
          </button>
        </div>

        <MoneyInput label="Valor" cents={amount} onChangeCents={setAmount} required placeholder="0,00" />

        <Input label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Supermercado, Salário" />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Conta" required value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sem categoria</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <Input label="Data" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />

        <ErrorBanner message={error} />
        <Button type="submit" disabled={submitting || accounts.length === 0} className="mt-2 w-full">
          {submitting ? 'Salvando…' : 'Salvar transação'}
        </Button>
        {accounts.length === 0 && (
          <p className="text-center text-xs text-text-muted">Cadastre uma conta antes de lançar transações.</p>
        )}
      </form>
    </Modal>
  );
}
