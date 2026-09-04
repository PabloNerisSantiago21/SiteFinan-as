import { z } from 'zod';
import { isoDate } from './date.validator.js';

export const createTransactionSchema = z.object({
  account_id: z.number().int().positive('Conta é obrigatória.'),
  category_id: z.number().int().positive().nullable().optional(),
  type: z.enum(['income', 'expense'], { message: 'Tipo deve ser income ou expense.' }),
  // Em centavos, sempre positivo — o sinal vem do campo `type`.
  amount: z.number().int('Valor deve ser informado em centavos (número inteiro).').positive('Valor deve ser maior que zero.'),
  description: z.string().trim().max(280).optional().default(''),
  date: isoDate,
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const listTransactionsQuerySchema = z.object({
  account_id: z.coerce.number().int().positive().optional(),
  category_id: z.coerce.number().int().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});
