import { createHandler, AppError } from '../_lib/handler.js';
import { query, queryOne, execute } from '../_lib/db.js';
import { createBudgetSchema } from '../_lib/validators/budget.validator.js';
import { isoPeriod } from '../_lib/validators/date.validator.js';

export default createHandler({
  GET: async (req, res, userId) => {
    const period = req.query.period ? isoPeriod.parse(req.query.period) : new Date().toISOString().slice(0, 7);
    const budgets = await query<Record<string, unknown> & { spent: number; amount: number }>(
      `SELECT b.*, c.name as category_name, c.color as category_color,
        COALESCE((
          SELECT SUM(t.amount) FROM transactions t
          WHERE t.category_id = b.category_id AND t.user_id = b.user_id
            AND t.type = 'expense' AND strftime('%Y-%m', t.date) = b.period
        ), 0) as spent
       FROM budgets b JOIN categories c ON c.id = b.category_id
       WHERE b.user_id = ? AND b.period = ? ORDER BY c.name ASC`,
      [userId, period]
    );
    const withProgress = budgets.map((b) => ({
      ...b,
      progress: b.amount > 0 ? Math.round((b.spent / b.amount) * 1000) / 10 : 0,
      remaining: b.amount - b.spent,
    }));
    res.json({ budgets: withProgress, period });
  },

  POST: async (req, res, userId) => {
    const data = createBudgetSchema.parse(req.body);
    const cat = await queryOne('SELECT id FROM categories WHERE id = ? AND user_id = ?', [data.category_id, userId]);
    if (!cat) throw new AppError('Categoria informada não existe ou não pertence a você.', 400);
    const dup = await queryOne('SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND period = ?', [userId, data.category_id, data.period]);
    if (dup) throw new AppError('Esta categoria já tem uma meta neste mês. Edite a meta existente.', 409);
    const { lastInsertRowid } = await execute(
      'INSERT INTO budgets (user_id, category_id, amount, period) VALUES (?, ?, ?, ?)',
      [userId, data.category_id, data.amount, data.period]
    );
    const budget = await queryOne('SELECT * FROM budgets WHERE id = ?', [lastInsertRowid]);
    res.status(201).json({ budget });
  },
});
