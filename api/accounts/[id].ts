import { createHandler, AppError } from '../_lib/handler.js';
import { queryOne, execute } from '../_lib/db.js';
import { updateAccountSchema } from '../_lib/validators/account.validator.js';

async function getOwned(id: number, userId: number) {
  const account = await queryOne('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [id, userId]);
  if (!account) throw new AppError('Conta não encontrada.', 404);
  return account;
}

export default createHandler({
  PUT: async (req, res, userId) => {
    const id = Number(req.query.id);
    await getOwned(id, userId);
    const data = updateAccountSchema.parse(req.body);
    const fields = Object.keys(data);
    if (fields.length === 0) throw new AppError('Nenhum campo para atualizar.', 400);

    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => {
      const v = (data as Record<string, unknown>)[f];
      return f === 'currency' && typeof v === 'string' ? v.toUpperCase() : v;
    });
    await execute(`UPDATE accounts SET ${setClause} WHERE id = ? AND user_id = ?`, [...values, id, userId] as (string|number)[]);
    const account = await queryOne('SELECT * FROM accounts WHERE id = ?', [id]);
    res.json({ account });
  },

  DELETE: async (req, res, userId) => {
    const id = Number(req.query.id);
    await getOwned(id, userId);
    await execute('DELETE FROM accounts WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(204).end();
  },
});
