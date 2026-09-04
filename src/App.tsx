import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Accounts } from './pages/Accounts';
import { Categories } from './pages/Categories';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { PageLoader } from './components/ui';

// Relatorios carrega sob demanda: a biblioteca de graficos responde por boa
// parte do bundle e so e necessaria nesta rota.
const Reports = lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contas" element={<Accounts />} />
            <Route path="/transacoes" element={<Transactions />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/orcamentos" element={<Budgets />} />
            <Route
              path="/relatorios"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Reports />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
