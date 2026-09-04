import { createHandler } from '../_lib/handler.js';
import { query } from '../_lib/db.js';

export default createHandler({
  GET: async (req, res, userId) => {
    const months = Math.min(Number(req.query.months) || 6, 24);
    const rows = await query(
      `SELECT strftime('%Y-%m', date) as period,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = ? AND date >= date('now', '-' || ? || ' months')
       GROUP BY period ORDER BY period ASC`,
      [userId, months]
    );
    res.json({ months: rows });
  },
});
