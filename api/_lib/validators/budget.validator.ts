import { z } from 'zod';
import { isoPeriod } from './date.validator.js';

export const createBudgetSchema = z.object({
  category_id: z.number().int().positive('Categoria é obrigatória.'),
  // Em centavos.
  amount: z.number().int('Valor deve ser informado em centavos (número inteiro).').positive('Valor da meta deve ser maior que zero.'),
  period: isoPeriod,
});

export const updateBudgetSchema = createBudgetSchema.partial();
