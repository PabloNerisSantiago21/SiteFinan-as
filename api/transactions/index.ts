import { createHandler, AppError } from '../_lib/handler.js';
import { query, queryOne, execute } from '../_lib/db.js';
import { createTransactionSchema, listTransactionsQuerySchema } from '../_lib/validators/transaction.validator.js';

export default createHandler({
  GET: async (req, res, userId) => {
    const q = listTransactionsQuerySchema.parse(req.query);
    let where = 'WHERE t.user_id = ?';
    const params: (string | number)[] = [userId];

    if (q.account_id) { where += ' AND t.account_id = ?'; params.push(q.account_id); }
    if (q.category_id) { where += ' AND t.category_id = ?'; params.push(q.category_id); }
    if (q.type) { where += ' AND t.type = ?'; params.push(q.type); }
    if (q.from) { where += ' AND t.date >= ?'; params.push(q.from); }
    if (q.to) { where += ' AND t.date <= ?'; params.push(q.to); }

    const offset = (q.page - 1) * q.limit;
    const countRow = await queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM transactions t ${where}`, params);
    const total = countRow?.count ?? 0;

    const transactions = await query(
      `SELECT t.*, a.name as account_name, c.name as category_name, c.color as category_color
       FROM transactions t
       LEFT JOIN accounts a ON a.id = t.account_id
       LEFT JOIN categories c ON c.id = t.category_id
       ${where}
       ORDER BY t.date DESC, t.id DESC
       LIMIT ? OFFSET ?`,
      [...params, q.limit, offset]
    );

    res.json({ transactions, pagination: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) } });
  },

  POST: async (req, res, userId) => {
    const data = createTransactionSchema.parse(req.body);
    const account = await queryOne('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [data.account_id, userId]);
    if (!account) throw new AppError('Conta informada não existe ou não pertence a você.', 400);
    if (data.category_id) {
      const cat = await queryOne('SELECT id FROM categories WHERE id = ? AND user_id = ?', [data.category_id, userId]);
      if (!cat) throw new AppError('Categoria informada não existe ou não pertence a você.', 400);
    }

    const { lastInsertRowid } = await execute(
      'INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, data.account_id, data.category_id ?? null, data.type, data.amount, data.description ?? '', data.date]
    );
    const transaction = await queryOne('SELECT * FROM transactions WHERE id = ?', [lastInsertRowid]);
    res.status(201).json({ transaction });
  },
});
