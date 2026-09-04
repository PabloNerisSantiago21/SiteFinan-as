import { createClient, type InValue } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/** Executa uma query e retorna as linhas como objetos tipados. */
export async function query<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T[]> {
  const result = await client.execute({ sql, args });
  return result.rows as T[];
}

/** Executa uma query e retorna a primeira linha, ou undefined. */
export async function queryOne<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  const rows = await query<T>(sql, args);
  return rows[0];
}

/** Executa um INSERT/UPDATE/DELETE e retorna lastInsertRowid e rowsAffected. */
export async function execute(sql: string, args: InValue[] = []) {
  const result = await client.execute({ sql, args });
  return {
    lastInsertRowid: Number(result.lastInsertRowid),
    rowsAffected: result.rowsAffected,
  };
}

export default client;
