import 'dotenv/config';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const now = new Date();
const today = now.getDate();

function thisMonth(day: number): string {
  const d = new Date(now.getFullYear(), now.getMonth(), Math.min(day, today));
  return d.toISOString().slice(0, 10);
}

function monthsBack(months: number, day: number): string {
  const d = new Date(now.getFullYear(), now.getMonth() - months, 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d.toISOString().slice(0, 10);
}

async function seed() {
  const email = 'demo@extrato.app';

  const existing = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) {
    await client.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [existing.rows[0].id as number] });
    console.log('Usuário demo anterior removido.');
  }

  const hash = await bcrypt.hash('demo123', 10);
  const userRes = await client.execute({ sql: 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', args: ['Rafael Souza', email, hash] });
  const userId = Number(userRes.lastInsertRowid);

  const insAcc = async (name: string, type: string, currency: string, balance: number) => {
    const r = await client.execute({ sql: 'INSERT INTO accounts (user_id, name, type, currency, initial_balance) VALUES (?, ?, ?, ?, ?)', args: [userId, name, type, currency, balance] });
    return Number(r.lastInsertRowid);
  };
  const nubank = await insAcc('Nubank', 'conta_corrente', 'BRL', 320000);
  const carteira = await insAcc('Carteira', 'carteira', 'BRL', 18000);
  await insAcc('Conta em dólar', 'investimento', 'USD', 50000);

  const insCat = async (name: string, type: string, color: string) => {
    const r = await client.execute({ sql: 'INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)', args: [userId, name, type, color] });
    return Number(r.lastInsertRowid);
  };
  const alimentacao = await insCat('Alimentação', 'expense', '#e8604b');
  const transporte = await insCat('Transporte', 'expense', '#f2b84b');
  const moradia = await insCat('Moradia', 'expense', '#c084fc');
  const lazer = await insCat('Lazer', 'expense', '#6ea8fe');
  const salario = await insCat('Salário', 'income', '#2fbf8f');
  const freelance = await insCat('Freelance', 'income', '#2fbf8f');

  const insTx = async (accId: number, catId: number, type: string, amount: number, desc: string, date: string) => {
    await client.execute({ sql: 'INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [userId, accId, catId, type, amount, desc, date] });
  };

  // Mês corrente
  await insTx(nubank, salario, 'income', 520000, 'Salário mensal', thisMonth(1));
  await insTx(nubank, moradia, 'expense', 165000, 'Aluguel', thisMonth(1));
  await insTx(nubank, alimentacao, 'expense', 32740, 'Supermercado do mês', thisMonth(3));
  await insTx(nubank, freelance, 'income', 89000, 'Projeto site cliente', thisMonth(5));
  await insTx(carteira, transporte, 'expense', 4200, 'Uber', thisMonth(6));
  await insTx(carteira, alimentacao, 'expense', 6890, 'Almoço', thisMonth(8));
  await insTx(nubank, lazer, 'expense', 5490, 'Streaming', thisMonth(10));
  await insTx(nubank, transporte, 'expense', 22000, 'Combustível', thisMonth(12));
  await insTx(carteira, alimentacao, 'expense', 3150, 'Padaria', thisMonth(15));
  await insTx(nubank, lazer, 'expense', 12000, 'Cinema e jantar', thisMonth(18));

  // Histórico
  const hist = [
    { salario: 520000, aluguel: 165000, mercado: 41020, transporte: 30500, lazer: 24000 },
    { salario: 520000, aluguel: 165000, mercado: 36680, transporte: 19800, lazer: 17500 },
    { salario: 480000, aluguel: 165000, mercado: 38950, transporte: 26200, lazer: 31000 },
  ];
  for (let i = 0; i < hist.length; i++) {
    const v = hist[i], back = i + 1;
    await insTx(nubank, salario, 'income', v.salario, 'Salário mensal', monthsBack(back, 1));
    await insTx(nubank, moradia, 'expense', v.aluguel, 'Aluguel', monthsBack(back, 1));
    await insTx(nubank, alimentacao, 'expense', v.mercado, 'Supermercado do mês', monthsBack(back, 4));
    await insTx(nubank, transporte, 'expense', v.transporte, 'Combustível e transporte', monthsBack(back, 11));
    await insTx(carteira, lazer, 'expense', v.lazer, 'Lazer do mês', monthsBack(back, 20));
  }

  // Orçamentos
  const period = now.toISOString().slice(0, 7);
  const insBudget = async (catId: number, amount: number) => {
    await client.execute({ sql: 'INSERT INTO budgets (user_id, category_id, amount, period) VALUES (?, ?, ?, ?)', args: [userId, catId, amount, period] });
  };
  await insBudget(alimentacao, 80000);
  await insBudget(transporte, 40000);
  await insBudget(lazer, 30000);

  console.log('✅ Dados de demonstração criados.');
  console.log('   Login: demo@extrato.app / demo123');
}

seed().catch((err) => { console.error('Erro:', err); process.exit(1); });
