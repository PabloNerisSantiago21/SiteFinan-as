# Finanças App — Backend

API REST para controle financeiro pessoal: contas, categorias, transações (receitas/despesas), metas de orçamento e relatórios.

## Stack

- Node.js + Express + TypeScript
- SQLite (via `better-sqlite3`) — banco de arquivo único, zero configuração
- Autenticação JWT + senhas com hash bcrypt
- Validação de dados com Zod

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

O servidor sobe em `http://localhost:3333`. O banco SQLite é criado automaticamente em `./data/financas.db` na primeira execução (schema aplicado via `src/db/schema.sql`).

Scripts disponíveis:
- `npm run dev` — desenvolvimento com hot-reload (tsx watch)
- `npm run build` — compila TypeScript para `dist/`
- `npm start` — roda a versão compilada (produção)

## Autenticação

Todas as rotas (exceto `/api/health`, `/api/auth/register` e `/api/auth/login`) exigem o header:

```
Authorization: Bearer <token>
```

O token é retornado no registro/login e expira em 7 dias.

## Endpoints

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cria usuário — `{ name, email, password }` |
| POST | `/api/auth/login` | Login — `{ email, password }` |
| GET | `/api/auth/me` | Dados do usuário logado |

### Contas (`/api/accounts`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Lista contas com saldo atual calculado |
| POST | `/` | Cria conta — `{ name, type, currency, initial_balance }` |
| PUT | `/:id` | Atualiza conta |
| DELETE | `/:id` | Remove conta (cascata: apaga transações ligadas) |

`type`: `carteira` \| `conta_corrente` \| `poupanca` \| `cartao_credito` \| `investimento` \| `outro`

### Categorias (`/api/categories`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/?type=income\|expense` | Lista categorias (filtro opcional por tipo) |
| POST | `/` | Cria categoria — `{ name, type, color }` |
| PUT | `/:id` | Atualiza categoria |
| DELETE | `/:id` | Remove categoria |

### Transações (`/api/transactions`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/?account_id&category_id&type&from&to&page&limit` | Lista com filtros e paginação |
| POST | `/` | Cria transação — `{ account_id, category_id, type, amount, description, date }` |
| PUT | `/:id` | Atualiza transação |
| DELETE | `/:id` | Remove transação |

`date` no formato `YYYY-MM-DD`.

### Metas de orçamento (`/api/budgets`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/?period=YYYY-MM` | Lista metas do período com gasto atual e % de progresso |
| POST | `/` | Cria meta — `{ category_id, amount, period }` |
| PUT | `/:id` | Atualiza meta |
| DELETE | `/:id` | Remove meta |

### Relatórios (`/api/reports`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/summary` | Saldo por conta, saldo total por moeda, totais do mês atual |
| GET | `/by-category?period&type` | Totais agrupados por categoria (alimenta gráfico de pizza) |
| GET | `/monthly?months=6` | Evolução de receitas x despesas nos últimos N meses (alimenta gráfico de linha) |

## Decisões de design

- **Sem conversão automática de moeda**: contas com moedas diferentes têm seus saldos somados *dentro do mesmo grupo de moeda* (`balanceByCurrency`), sem taxa de câmbio automática. Evita a complexidade e o risco de dados desatualizados de uma API de câmbio externa.
- **SQLite**: suficiente para uso pessoal/portfólio. Migrar para PostgreSQL no futuro é simples — trocar o driver mantendo a mesma estrutura de queries.
- **Todo dado é isolado por `user_id`**: nenhuma query cruza dados entre usuários (checado inclusive ao vincular transação a conta/categoria de outro usuário).

## Estrutura de pastas

```
src/
  app.ts              # configuração do Express
  server.ts           # ponto de entrada
  db/
    schema.sql
    index.ts
  middleware/
    auth.ts            # JWT guard
    errorHandler.ts
  validators/           # schemas Zod por entidade
  controllers/           # lógica de negócio por entidade
  routes/                 # definição das rotas por entidade
  utils/
    jwt.ts
    password.ts
```
