import { formatMoney } from '../lib/format';
import type { Budget } from '../types';
import { Card } from './ui';

/**
 * Três estados possíveis, que mudam a cor da barra e a mensagem:
 * dentro da meta, perto do limite (>= 80%) e estourada (> 100%).
 */
function status(progress: number) {
  if (progress > 100) return { color: 'var(--color-expense)', tone: 'text-expense' as const };
  if (progress >= 80) return { color: 'var(--color-accent)', tone: 'text-accent' as const };
  return { color: 'var(--color-income)', tone: 'text-income' as const };
}

export function BudgetCard({ budget, onEdit, onDelete }: { budget: Budget; onEdit: () => void; onDelete: () => void }) {
  const { color, tone } = status(budget.progress);
  const exceeded = budget.remaining < 0;
  const barWidth = Math.min(budget.progress, 100);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: budget.category_color }} />
          <p className="truncate font-medium text-text">{budget.category_name}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={onEdit} className="text-xs text-text-muted hover:text-text">
            editar
          </button>
          <button onClick={onDelete} className="text-xs text-text-muted hover:text-expense">
            excluir
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="money text-xl font-medium text-text">{formatMoney(budget.spent)}</span>
          <span className="text-sm text-text-muted">de {formatMoney(budget.amount)}</span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-alt"
        role="progressbar"
        aria-valuenow={Math.round(budget.progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Meta de ${budget.category_name}`}
      >
        <div className="h-full rounded-full transition-[width]" style={{ width: `${barWidth}%`, backgroundColor: color }} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={`money font-medium ${tone}`}>{budget.progress.toFixed(1)}%</span>
        <span className={exceeded ? 'text-expense' : 'text-text-muted'}>
          {exceeded ? `${formatMoney(Math.abs(budget.remaining))} acima da meta` : `restam ${formatMoney(budget.remaining)}`}
        </span>
      </div>
    </Card>
  );
}
