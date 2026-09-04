import { createHandler, AppError } from '../_lib/handler.js';
import { queryOne, execute } from '../_lib/db.js';
import { updateTransactionSchema } from '../_lib/validators/transaction.validator.js';

async function getOwned(id: number, userId: number) {
  const tx = await queryOne('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
  if (!tx) throw new AppError('Transação não encontrada.', 404);
  return tx;
}

export default createHandler({
  PUT: async (req, res, userId) => {
    const id = Number(req.query.id);
    await getOwned(id, userId);
    const data = updateTransactionSchema.parse(req.body);
    if (data.account_id) {
      const acc = await queryOne('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [data.account_id, userId]);
      if (!acc) throw new AppError('Conta informada não existe ou não pertence a você.', 400);
    }
    if (data.category_id !== undefined && data.category_id !== null) {
      const cat = await queryOne('SELECT id FROM categories WHERE id = ? AND user_id = ?', [data.category_id, userId]);
      if (!cat) throw new AppError('Categoria informada não existe ou não pertence a você.', 400);
    }
    const fields = Object.keys(data);
    if (fields.length === 0) throw new AppError('Nenhum campo para atualizar.', 400);
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => (data as Record<string, unknown>)[f]);
    await execute(`UPDATE transactions SET ${setClause} WHERE id = ? AND user_id = ?`, [...values, id, userId] as (string|number|null)[]);
    const transaction = await queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
    res.json({ transaction });
  },

  DELETE: async (req, res, userId) => {
    const id = Number(req.query.id);
    await getOwned(id, userId);
    await execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(204).end();
  },
});
