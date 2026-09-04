const API_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  details?: Array<{ path: string; message: string }>;
  constructor(message: string, status: number, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function getToken(): string | null {
  return localStorage.getItem('financas_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('financas_token', token);
  else localStorage.removeItem('financas_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiError(body?.error || `Erro ${res.status}`, res.status, body?.details);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
