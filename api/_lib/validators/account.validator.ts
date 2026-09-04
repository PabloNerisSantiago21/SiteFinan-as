import { z } from 'zod';

export const accountTypes = ['carteira', 'conta_corrente', 'poupanca', 'cartao_credito', 'investimento', 'outro'] as const;

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, 'Nome da conta é obrigatório.'),
  type: z.enum(accountTypes).default('carteira'),
  currency: z.string().trim().length(3, 'Moeda deve ser um código de 3 letras (ex: BRL, USD).').default('BRL'),
  // Em centavos. Aceita negativo (ex: fatura de cartão já em aberto).
  initial_balance: z.number().int('Saldo deve ser informado em centavos (número inteiro).').default(0),
});

export const updateAccountSchema = createAccountSchema.partial();
