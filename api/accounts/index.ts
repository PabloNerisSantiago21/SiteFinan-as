import { createHandler } from '../_lib/handler.js';
import { query, queryOne, execute } from '../_lib/db.js';
import { createAccountSchema } from '../_lib/validators/account.validator.js';

export default createHandler({
  GET: async (_req, res, userId) => {
    const accounts = await query(
      `SELECT a.*,
        COALESCE(a.initial_balance +
          (SELECT COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0)
           FROM transactions t WHERE t.account_id = a.id), a.initial_balance) AS current_balance
       FROM accounts a WHERE a.user_id = ? ORDER BY a.created_at ASC`,
      [userId]
    );
    res.json({ accounts });
  },

  POST: async (req, res, userId) => {
    const data = createAccountSchema.parse(req.body);
    const { lastInsertRowid } = await execute(
      'INSERT INTO accounts (user_id, name, type, currency, initial_balance) VALUES (?, ?, ?, ?, ?)',
      [userId, data.name, data.type, data.currency.toUpperCase(), data.initial_balance]
    );
    const account = await queryOne('SELECT * FROM accounts WHERE id = ?', [lastInsertRowid]);
    res.status(201).json({ account });
  },
});
