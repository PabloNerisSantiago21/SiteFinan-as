import { createHandler } from '../_lib/handler.js';
import { query, queryOne } from '../_lib/db.js';

export default createHandler({
  GET: async (_req, res, userId) => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const accounts = await query<{ id: number; name: string; type: string; currency: string; balance: number }>(
      `SELECT a.id, a.name, a.type, a.currency,
        a.initial_balance +
          COALESCE((SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
                     FROM transactions t WHERE t.account_id = a.id), 0) AS balance
       FROM accounts a WHERE a.user_id = ? ORDER BY a.created_at ASC`,
      [userId]
    );

    const balanceByCurrency: Record<string, number> = {};
    for (const acc of accounts) {
      balanceByCurrency[acc.currency] = (balanceByCurrency[acc.currency] || 0) + acc.balance;
    }

    const monthTotals = await queryOne<{ income: number; expense: number }>(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ?`,
      [userId, currentMonth]
    );

    res.json({
      accounts,
      balanceByCurrency,
      currentMonth,
      monthIncome: monthTotals?.income ?? 0,
      monthExpense: monthTotals?.expense ?? 0,
      monthNet: (monthTotals?.income ?? 0) - (monthTotals?.expense ?? 0),
    });
  },
});
