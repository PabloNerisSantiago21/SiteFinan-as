import { formatMoney } from '../lib/format';
import type { Transaction } from '../types';
import { Stamp } from './ui';

export function TransactionRow({ tx, onEdit, onDelete }: { tx: Transaction; onEdit: () => void; onDelete: () => void }) {
  const isIncome = tx.type === 'income';

  return (
    <div className="group flex items-center gap-3 border-b border-border/70 py-3 last:border-b-0">
      <Stamp type={isIncome ? 'income' : 'expense'}>{isIncome ? 'Entrada' : 'Saída'}</Stamp>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text">{tx.description || tx.category_name || 'Sem descrição'}</p>
        <p className="truncate text-xs text-text-muted">
          {tx.account_name}
          {tx.category_name ? ` · ${tx.category_name}` : ''}
        </p>
      </div>

      <span className="leader hidden sm:block" />

      <p className={`money shrink-0 text-sm font-medium ${isIncome ? 'text-income' : 'text-expense'}`}>
        {isIncome ? '+' : '-'} {formatMoney(tx.amount)}
      </p>

      <div className="flex shrink-0 gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onEdit} className="text-xs text-text-muted hover:text-text" aria-label="Editar transação">
          editar
        </button>
        <button onClick={onDelete} className="text-xs text-text-muted hover:text-expense" aria-label="Excluir transação">
          excluir
        </button>
      </div>
    </div>
  );
}
