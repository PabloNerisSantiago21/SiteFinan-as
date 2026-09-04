import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Nome da categoria é obrigatório.'),
  type: z.enum(['income', 'expense'], { message: 'Tipo deve ser income ou expense.' }),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser um hex válido, ex: #6366f1.').default('#6366f1'),
});

export const updateCategorySchema = createCategorySchema.partial();
