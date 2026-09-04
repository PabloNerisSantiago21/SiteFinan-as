import { useState, type FormEvent } from 'react';
import { Button, ErrorBanner, Input, Modal, MoneyInput, Select } from './ui';
import { api, ApiError } from '../lib/api';
import { ACCOUNT_TYPE_LABELS } from '../lib/format';
import type { Account } from '../types';

const CURRENCIES = ['BRL', 'USD', 'EUR'];

export function AccountModal({
  open,
  onClose,
  onSaved,
  account,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  account?: Account | null;
}) {
  const isEdit = Boolean(account);
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState(account?.type ?? 'conta_corrente');
  const [currency, setCurrency] = useState(account?.currency ?? 'BRL');
  const [initialBalance, setInitialBalance] = useState<number | null>(account?.initial_balance ?? 0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (initialBalance === null) {
      setError('Informe um saldo inicial válido.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name, type, currency, initial_balance: initialBalance };
      if (isEdit && account) {
        await api.put(`/accounts/${account.id}`, payload);
      } else {
        await api.post('/accounts', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a conta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar conta' : 'Nova conta'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank, Carteira, Poupança" />

        <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value as Account['type'])}>
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Moeda" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <MoneyInput label="Saldo inicial" cents={initialBalance} onChangeCents={setInitialBalance} />
        </div>

        <ErrorBanner message={error} />
        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? 'Salvando…' : 'Salvar conta'}
        </Button>
      </form>
    </Modal>
  );
}
