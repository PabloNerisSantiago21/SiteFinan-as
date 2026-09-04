import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney } from '../lib/format';

export interface CategoryTotal {
  category_id: number;
  category_name: string;
  category_color: string;
  total: number;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryTotal }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface-alt px-3 py-2 text-sm shadow-lg">
      <p className="text-text">{item.category_name}</p>
      <p className="money text-text-muted">{formatMoney(item.total)}</p>
    </div>
  );
}

export function CategoryDonut({ data }: { data: CategoryTotal[] }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category_name"
              innerRadius={64}
              outerRadius={92}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.category_id} fill={entry.category_color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Total no centro da rosca */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-widest text-text-muted">Total</span>
          <span className="money text-lg font-medium text-text">{formatMoney(total)}</span>
        </div>
      </div>

      {/* Legenda com participação de cada categoria */}
      <ul className="flex w-full flex-col gap-2">
        {data.map((item) => {
          const share = total > 0 ? (item.total / total) * 100 : 0;
          return (
            <li key={item.category_id} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.category_color }} />
              <span className="truncate text-text">{item.category_name}</span>
              <span className="leader" />
              <span className="money shrink-0 text-text-muted">{share.toFixed(1)}%</span>
              <span className="money w-24 shrink-0 text-right text-text">{formatMoney(item.total)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
