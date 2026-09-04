import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { DashboardSummary, Transaction } from '../types';
import { Card, EmptyState, ErrorBanner, PageLoader, Stamp, Button } from '../components/ui';
import { formatMoney, formatDateLong, ACCOUNT_TYPE_LABELS } from '../lib/format';
import { useAuth } from '../context/AuthContext';

function MonthLabel({ period }: { period: string }) {
  const [y, m] = period.split('-').map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return <span className="capitalize">{label}</span>;
}

export function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<DashboardSummary>('/reports/summary'),
      api.get<{ transactions: Transaction[] }>('/transactions?limit=5'),
    ])
      .then(([summaryRes, txRes]) => {
        setSummary(summaryRes);
        setRecent(txRes.transactions);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o painel.'));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!summary) return <PageLoader />;

  const currencies = Object.entries(summary.balanceByCurrency);
  const hasAccounts = summary.accounts.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-display text-2xl text-text">Olá, {user?.name.split(' ')[0]}</p>
        <p className="text-sm text-text-muted">
          Resumo de <MonthLabel period={summary.currentMonth} />
        </p>
      </div>

      {!hasAccounts ? (
        <EmptyState
          title="Comece cadastrando uma conta"
          hint="Suas contas são a base de tudo. Depois disso você pode lançar receitas e despesas."
          action={
            <Link to="/contas">
              <Button>Cadastrar conta</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Saldo total por moeda */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {currencies.map(([currency, balance]) => (
              <Card key={currency}>
                <p className="text-xs uppercase tracking-widest text-text-muted">Saldo total · {currency}</p>
                <p className={`money mt-2 text-3xl font-medium ${balance < 0 ? 'text-expense' : 'text-text'}`}>
                  {formatMoney(balance, currency)}
                </p>
              </Card>
            ))}
          </div>

          {/* Receitas x despesas do mês */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-text-muted">Entradas</p>
                <Stamp type="income">mês</Stamp>
              </div>
              <p className="money mt-3 text-2xl font-medium text-income">{formatMoney(summary.monthIncome)}</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-text-muted">Saídas</p>
                <Stamp type="expense">mês</Stamp>
              </div>
              <p className="money mt-3 text-2xl font-medium text-expense">{formatMoney(summary.monthExpense)}</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-text-muted">Resultado</p>
                <Stamp type="neutral">saldo</Stamp>
              </div>
              <p className={`money mt-3 text-2xl font-medium ${summary.monthNet < 0 ? 'text-expense' : 'text-income'}`}>
                {formatMoney(summary.monthNet)}
              </p>
            </Card>
          </div>

          {/* Contas */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg text-text">Suas contas</p>
              <Link to="/contas" className="text-sm text-accent hover:underline">
                Gerenciar
              </Link>
            </div>
            <Card className="flex flex-col gap-1 p-4">
              {summary.accounts.map((a) => (
                <div key={a.id} className="flex items-center py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{a.name}</p>
                    <p className="text-xs text-text-muted">{ACCOUNT_TYPE_LABELS[a.type]}</p>
                  </div>
                  <span className="leader" />
                  <p className={`money shrink-0 text-sm font-medium ${a.balance < 0 ? 'text-expense' : 'text-text'}`}>
                    {formatMoney(a.balance, a.currency)}
                  </p>
                </div>
              ))}
            </Card>
          </div>

          {/* Últimas transações */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg text-text">Últimos lançamentos</p>
              <Link to="/transacoes" className="text-sm text-accent hover:underline">
                Ver todos
              </Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState
                title="Nenhum lançamento ainda"
                hint="Registre sua primeira receita ou despesa para ver o movimento aqui."
                action={
                  <Link to="/transacoes">
                    <Button>Lançar transação</Button>
                  </Link>
                }
              />
            ) : (
              <Card className="flex flex-col gap-1 p-4">
                {recent.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-2">
                    <Stamp type={tx.type === 'income' ? 'income' : 'expense'}>
                      {tx.type === 'income' ? 'Entrada' : 'Saída'}
                    </Stamp>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text">{tx.description || tx.category_name || 'Sem descrição'}</p>
                      <p className="text-xs text-text-muted">{formatDateLong(tx.date)}</p>
                    </div>
                    <span className="leader" />
                    <p className={`money shrink-0 text-sm font-medium ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatMoney(tx.amount)}
                    </p>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
