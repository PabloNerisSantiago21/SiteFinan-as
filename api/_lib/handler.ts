import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from './jwt.js';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

type HandlerFn = (req: VercelRequest, res: VercelResponse, userId: number) => Promise<void>;

interface HandlerMap {
  GET?: HandlerFn;
  POST?: HandlerFn;
  PUT?: HandlerFn;
  DELETE?: HandlerFn;
}

/**
 * Cria um handler Vercel com CORS, autenticação JWT e roteamento por método.
 * Passa `auth: false` para rotas públicas (login, register, health).
 */
export function createHandler(methods: HandlerMap, options: { auth?: boolean } = {}) {
  const { auth = true } = options;

  return async (req: VercelRequest, res: VercelResponse) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    // Método
    const handler = methods[req.method as keyof HandlerMap];
    if (!handler) return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    // Autenticação
    let userId = 0;
    if (auth) {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
      }
      try {
        const payload = verifyToken(authHeader.slice(7));
        userId = payload.userId;
      } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
      }
    }

    // Execução com tratamento de erro centralizado
    try {
      await handler(req, res, userId);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos.',
          details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
      }
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      const anyErr = err as { code?: string };
      if (anyErr?.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err instanceof Error && err.message?.includes('UNIQUE'))) {
        return res.status(409).json({ error: 'Já existe um registro com esses dados.' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  };
}
