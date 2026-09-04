import { createHandler } from '../_lib/handler.js';
import { query } from '../_lib/db.js';
import { isoPeriod } from '../_lib/validators/date.validator.js';

export default createHandler({
  GET: async (req, res, userId) => {
    const period = req.query.period ? isoPeriod.parse(req.query.period) : new Date().toISOString().slice(0, 7);
    const type = req.query.type === 'income' ? 'income' : 'expense';

    const categories = await query(
      `SELECT c.id as category_id, c.name as category_name, c.color as category_color,
        COALESCE(SUM(t.amount), 0) as total
       FROM categories c
       LEFT JOIN transactions t ON t.category_id = c.id AND t.type = ? AND strftime('%Y-%m', t.date) = ? AND t.user_id = c.user_id
       WHERE c.user_id = ? AND c.type = ?
       GROUP BY c.id HAVING total > 0 ORDER BY total DESC`,
      [type, period, userId, type]
    );

    res.json({ period, type, categories });
  },
});
