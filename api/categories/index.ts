import { createHandler } from '../_lib/handler.js';
import { query, queryOne, execute } from '../_lib/db.js';
import { createCategorySchema } from '../_lib/validators/category.validator.js';

export default createHandler({
  GET: async (req, res, userId) => {
    const { type } = req.query;
    let sql = 'SELECT * FROM categories WHERE user_id = ?';
    const args: (string | number)[] = [userId];
    if (type === 'income' || type === 'expense') { sql += ' AND type = ?'; args.push(type); }
    sql += ' ORDER BY name ASC';
    const categories = await query(sql, args);
    res.json({ categories });
  },

  POST: async (req, res, userId) => {
    const data = createCategorySchema.parse(req.body);
    const { lastInsertRowid } = await execute(
      'INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)',
      [userId, data.name, data.type, data.color]
    );
    const category = await queryOne('SELECT * FROM categories WHERE id = ?', [lastInsertRowid]);
    res.status(201).json({ category });
  },
});
