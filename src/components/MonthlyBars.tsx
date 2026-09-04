import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatMoney, formatPeriodShort, formatPeriod } from '../lib/format';

export interface MonthTotals {
  period: string;
  income: number;
  expense: number;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const income = payload.find((p) => p.dataKey === 'income')?.value ?? 0;
  const expense = payload.find((p) => p.dataKey === 'expense')?.value ?? 0;
  const net = income - expense;

  return (
    <div className="min-w-44 rounded-md border border-border bg-surface-alt px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 capitalize text-text">{label ? formatPeriod(label) : ''}</p>
      <div className="flex items-center gap-2">
        <span className="text-text-muted">Entradas</span>
        <span className="leader" />
        <span className="money text-income">{formatMoney(income)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-text-muted">Saídas</span>
        <span className="leader" />
        <span className="money text-expense">{formatMoney(expense)}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 border-t border-border pt-1">
        <span className="text-text-muted">Resultado</span>
        <span className="leader" />
        <span className={`money ${net < 0 ? 'text-expense' : 'text-income'}`}>{formatMoney(net)}</span>
      </div>
    </div>
  );
}

export function MonthlyBars({ data }: { data: MonthTotals[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="period"
            tickFormatter={formatPeriodShort}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => (v / 100).toLocaleString('pt-BR', { notation: 'compact' })}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-alt)', opacity: 0.4 }} />
          <Legend
            formatter={(value) => (
              <span className="text-sm text-text-muted">{value === 'income' ? 'Entradas' : 'Saídas'}</span>
            )}
          />
          <Bar dataKey="income" fill="var(--color-income)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="expense" fill="var(--color-expense)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
