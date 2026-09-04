/**
 * Todos os valores monetários são INTEIROS em centavos, igual ao banco de dados.
 * Use formatMoney() para exibir e inputToCents() para ler o que o usuário digita.
 */

export interface User {
  id: number;
  name: string;
  email: string;
}

export type AccountType =
  | 'carteira'
  | 'conta_corrente'
  | 'poupanca'
  | 'cartao_credito'
  | 'investimento'
  | 'outro';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  currency: string;
  /** Em centavos (inteiro). */
  initial_balance: number;
  /** Em centavos (inteiro). */
  current_balance: number;
  created_at: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number | null;
  account_name?: string;
  category_name?: string | null;
  category_color?: string | null;
  type: CategoryType;
  /** Em centavos (inteiro), sempre positivo — o sinal vem de `type`. */
  amount: number;
  description: string;
  date: string;
}

export interface CategoryReportItem {
  category_id: number;
  category_name: string;
  category_color: string;
  /** Em centavos (inteiro). */
  total: number;
}

export interface MonthlyReportItem {
  period: string;
  /** Em centavos (inteiro). */
  income: number;
  /** Em centavos (inteiro). */
  expense: number;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_color: string;
  /** Meta em centavos (inteiro). */
  amount: number;
  /** Gasto em centavos (inteiro). */
  spent: number;
  /** Sobra em centavos (inteiro), pode ser negativa. */
  remaining: number;
  /** Percentual já gasto da meta. */
  progress: number;
  period: string;
}

export interface DashboardSummary {
  accounts: Array<{ id: number; name: string; type: AccountType; currency: string; balance: number }>;
  /** Saldos em centavos (inteiro), agrupados por moeda. */
  balanceByCurrency: Record<string, number>;
  currentMonth: string;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_color: string;
  /** Meta definida, em centavos. */
  amount: number;
  /** Já gasto na categoria dentro do período, em centavos. */
  spent: number;
  /** Quanto ainda cabe na meta, em centavos. Negativo quando estourou. */
  remaining: number;
  /** Percentual da meta consumido. Ex.: 53.5 */
  progress: number;
  /** Período no formato 'YYYY-MM'. */
  period: string;
}
