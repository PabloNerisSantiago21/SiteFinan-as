import { createHandler, AppError } from '../_lib/handler.js';
import { queryOne, execute } from '../_lib/db.js';
import { updateBudgetSchema } from '../_lib/validators/budget.validator.js';

async function getOwned(id: number, userId: number) {
  const b = await queryOne('SELECT * FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
  if (!b) throw new AppError('Meta de orçamento não encontrada.', 404);
  return b;
}

export default createHandler({
  PUT: async (req, res, userId) => {
    const id = Number(req.query.id);
    await getOwned(id, userId);
    const data = updateBudgetSchema.parse(req.body);
    if (data.category_id) {
      const cat = await queryOne('SELECT id FROM categories WHERE id = ? AND user_id = ?', [data.category_id, userId]);
      if (!cat) throw new AppError('Categoria informada não existe ou não pertence a você.', 400);
    }
    const fields = Object.keys(data);
    if (fields.length === 0) throw new AppError('Nenhum campo para atualizar.', 400);
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => (data as Record<string, unknown>)[f]);
    await execute(`UPDATE budgets SET ${setClause} WHERE id = ? AND user_id = ?`, [...values, id, userId] as (string|number)[]);
    const budget = await queryOne('SELECT * FROM budgets WHERE id = ?', [id]);
    res.json({ budget });
  },

  DELETE: async (req, res, userId) => {
    const id = Number(req.query.id);
    await getOwned(id, userId);
    await execute('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(204).end();
  },
});
