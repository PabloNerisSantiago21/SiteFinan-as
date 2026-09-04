import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Painel', end: true },
  { to: '/contas', label: 'Contas' },
  { to: '/transacoes', label: 'Transações' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/orcamentos', label: 'Orçamentos' },
  { to: '/relatorios', label: 'Relatórios' },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-8 px-2">
        <p className="font-display text-2xl leading-none text-text">Extrato</p>
        <p className="mt-1 text-xs uppercase tracking-widest text-text-muted">Controle financeiro</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-accent-soft text-accent' : 'text-text-muted hover:bg-surface-alt hover:text-text'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border pt-4">
        <p className="truncate px-2 text-sm font-medium text-text">{user?.name}</p>
        <p className="truncate px-2 text-xs text-text-muted">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-md px-2 py-2 text-left text-sm text-text-muted hover:bg-surface-alt hover:text-expense"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
