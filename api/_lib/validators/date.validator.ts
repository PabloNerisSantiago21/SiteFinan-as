import { z } from 'zod';

/**
 * Uma regex de formato não basta: `2026-13-45` tem o formato certo e mesmo assim
 * não existe. Estes validadores conferem o calendário de verdade, inclusive
 * dias inválidos em meses curtos e anos não bissextos (ex.: 2026-02-30).
 */

/** Data no formato YYYY-MM-DD que exista de fato no calendário. */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD.')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    if (month < 1 || month > 12) return false;
    const lastDay = new Date(year, month, 0).getDate();
    return day >= 1 && day <= lastDay;
  }, 'Data inexistente no calendário.');

/** Período mensal no formato YYYY-MM, com mês entre 01 e 12. */
export const isoPeriod = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Período deve estar no formato YYYY-MM.')
  .refine((value) => {
    const month = Number(value.split('-')[1]);
    return month >= 1 && month <= 12;
  }, 'Mês deve estar entre 01 e 12.');
