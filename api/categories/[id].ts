import { createHandler, AppError } from '../_lib/handler.js';
import { queryOne, execute } from '../_lib/db.js';
import { updateCategorySchema } from '../_lib/validators/category.validator.js';

async function getOwned(id: number, userId: number) {
  const cat = await queryOne('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
  if (!cat) throw new AppError('Categoria não encontrada.', 404);
  return cat;
}

export default createHandler({
  PUT: async (req, res, userId) => {
    const id = Number(req.query.id);
    await getOwned(id, userId);
    const data = updateCategorySchema.parse(req.body);
    const fields = Object.keys(data);
    if (fields.length === 0) throw new AppError('Nenhum campo para atualizar.', 400);
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => (data as Record<string, unknown>)[f]);
    await execute(`UPDATE categories SET ${setClause} WHERE id = ? AND user_id = ?`, [...values, id, userId] as (string|number)[]);
    const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ category });
  },

  DELETE: async (req, res, userId) => {
    const id = Number(req.query.id);
    await getOwned(id, userId);
    await execute('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(204).end();
  },
});
