/**
 * Valores monetários trafegam e são guardados como INTEIROS em centavos.
 * A conversão para reais acontece apenas na exibição e na leitura do que o
 * usuário digita — as duas funções abaixo são a única fronteira onde isso ocorre.
 */

/** Formata centavos para exibição. Ex.: 3150 -> "R$ 31,50" */
export function formatMoney(cents: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(cents / 100);
}

/** Converte centavos para o valor a exibir num campo de formulário. Ex.: 3150 -> "31.50" */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Converte o que o usuário digitou para centavos, aceitando vírgula ou ponto.
 * Ex.: "31,50" -> 3150 | "31.5" -> 3150 | "" -> null
 */
export function inputToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
  if (normalized === '') return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
}

export function formatDateLong(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Rótulo de um período 'YYYY-MM'. Ex.: "2026-09" -> "setembro de 2026" */
export function formatPeriod(period: string): string {
  const [y, m] = period.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/** Rótulo curto de um período, para eixos de gráfico. Ex.: "2026-09" -> "set/26" */
export function formatPeriodShort(period: string): string {
  const [y, m] = period.split('-').map(Number);
  const mes = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${mes}/${String(y).slice(2)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  carteira: 'Carteira',
  conta_corrente: 'Conta corrente',
  poupanca: 'Poupança',
  cartao_credito: 'Cartão de crédito',
  investimento: 'Investimento',
  outro: 'Outro',
};
