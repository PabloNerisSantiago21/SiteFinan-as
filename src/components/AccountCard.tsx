import { formatMoney, ACCOUNT_TYPE_LABELS } from '../lib/format';
import type { Account } from '../types';
import { Card } from './ui';

export function AccountCard({ account, onEdit, onDelete }: { account: Account; onEdit: () => void; onDelete: () => void }) {
  const negative = account.current_balance < 0;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-text">{account.name}</p>
          <p className="text-xs text-text-muted">{ACCOUNT_TYPE_LABELS[account.type]} · {account.currency}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="rounded p-1 text-xs text-text-muted hover:bg-surface-alt hover:text-text" aria-label="Editar conta">
            editar
          </button>
          <button onClick={onDelete} className="rounded p-1 text-xs text-text-muted hover:bg-surface-alt hover:text-expense" aria-label="Excluir conta">
            excluir
          </button>
        </div>
      </div>
      <p className={`money text-2xl font-medium ${negative ? 'text-expense' : 'text-text'}`}>
        {formatMoney(account.current_balance, account.currency)}
      </p>
    </Card>
  );
}
