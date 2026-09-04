# Extrato — Controle Financeiro Pessoal

Aplicação full-stack para acompanhar receitas e despesas, hospedada inteiramente na Vercel.

**Frontend**: React + Vite + Tailwind CSS
**Backend**: Vercel Serverless Functions
**Banco de dados**: Turso (SQLite na nuvem)

## Deploy na Vercel (passo a passo)

### 1. Criar o banco de dados no Turso

Crie uma conta gratuita em [turso.tech](https://turso.tech) e instale o CLI:

```bash
# macOS / Linux
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login

# Criar o banco
turso db create extrato
turso db show extrato --url     # copia a URL (libsql://...)
turso db tokens create extrato  # copia o token
```

### 2. Configurar o projeto localmente

```bash
git clone <seu-repo>
cd extrato-vercel
npm install
cp .env.example .env
```

Edite o `.env` e cole a URL e o token do Turso:
```
TURSO_DATABASE_URL=libsql://extrato-seu-usuario.turso.io
TURSO_AUTH_TOKEN=eyJ...
JWT_SECRET=um-segredo-forte-qualquer
```

### 3. Criar as tabelas e popular com dados de demonstração

```bash
npm run db:setup    # cria tabelas e índices
npm run db:seed     # opcional: cria usuário demo
```

### 4. Subir na Vercel

Suba o código para o GitHub. No [vercel.com](https://vercel.com):

1. "Add New Project" → importe o repositório
2. **Framework Preset**: Vite
3. **Environment Variables**: adicione as três variáveis do `.env`
4. Clique em **Deploy**

Pronto. O site estará no ar com a URL que a Vercel gerar.

Se usou o seed, entre com **demo@extrato.app** / **demo123**.

### 5. Deploy via CLI (alternativa)

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Desenvolvimento local

```bash
npm install -g vercel
vercel link           # conecta ao projeto
vercel dev            # sobe frontend + API juntos em localhost:3000
```

Ou, se preferir só o frontend (apontando para a Vercel em produção):
```bash
npx vite dev
```

## Estrutura do projeto

```
api/
  _lib/                    # código compartilhado (não é endpoint)
    db.ts                  # cliente Turso
    handler.ts             # CORS, auth, método, erros
    jwt.ts / password.ts
    validators/
  health.ts
  auth/register.ts login.ts me.ts
  accounts/index.ts [id].ts
  categories/index.ts [id].ts
  transactions/index.ts [id].ts
  budgets/index.ts [id].ts
  reports/summary.ts by-category.ts monthly.ts
src/                       # React frontend (mesmo do projeto original)
scripts/
  setup-db.ts              # cria tabelas no Turso
  seed.ts                  # dados de demonstração
vercel.json                # rewrites (SPA + API)
```

## O que mudou em relação ao projeto local

| Antes (Express + SQLite) | Agora (Vercel + Turso) |
|---|---|
| Servidor Express permanente | Serverless functions (uma por rota) |
| better-sqlite3 (arquivo local) | @libsql/client (Turso na nuvem) |
| Queries síncronas | Queries assíncronas (await) |
| `npm run dev` sobe o Express | `vercel dev` sobe tudo junto |
| Banco morre se o disco formata | Banco persiste na nuvem |

A lógica de negócio, as queries SQL, os validadores, e todo o frontend são os mesmos. A única diferença é como o código é empacotado (serverless em vez de servidor) e onde o banco mora (nuvem em vez de arquivo).
