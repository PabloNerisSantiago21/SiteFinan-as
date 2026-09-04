import { createHandler, AppError } from '../_lib/handler.js';
import { queryOne } from '../_lib/db.js';

export default createHandler({
  GET: async (_req, res, userId) => {
    const user = await queryOne('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    res.json({ user });
  },
});
