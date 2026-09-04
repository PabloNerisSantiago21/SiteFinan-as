import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Category } from '../types';
import { Button, EmptyState, ErrorBanner, PageLoader } from '../components/ui';
import { CategoryModal } from '../components/CategoryModal';

function CategoryRow({ category, onEdit, onDelete }: { category: Category; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
        <span className="text-sm text-text">{category.name}</span>
      </div>
      <div className="flex gap-3">
        <button onClick={onEdit} className="text-xs text-text-muted hover:text-text">
          editar
        </button>
        <button onClick={onDelete} className="text-xs text-text-muted hover:text-expense">
          excluir
        </button>
      </div>
    </div>
  );
}

export function Categories() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ categories: Category[] }>('/categories');
      setCategories(res.categories);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as categorias.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(category: Category) {
    if (!confirm(`Excluir a categoria "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category.id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível excluir a categoria.');
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setModalOpen(true);
  }

  if (categories === null) return <PageLoader />;

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-2xl text-text">Categorias</p>
          <p className="text-sm text-text-muted">Organize suas receitas e despesas do seu jeito</p>
        </div>
        <Button onClick={openNew}>+ Nova categoria</Button>
      </div>

      <ErrorBanner message={error} />

      {categories.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          hint="Crie categorias como Alimentação, Transporte ou Salário para organizar seus lançamentos."
          action={<Button onClick={openNew}>+ Nova categoria</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="stamp text-expense">Despesas</p>
            {expenseCategories.length === 0 && <p className="text-sm text-text-muted">Nenhuma categoria de despesa ainda.</p>}
            {expenseCategories.map((c) => (
              <CategoryRow key={c.id} category={c} onEdit={() => openEdit(c)} onDelete={() => handleDelete(c)} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="stamp text-income">Receitas</p>
            {incomeCategories.length === 0 && <p className="text-sm text-text-muted">Nenhuma categoria de receita ainda.</p>}
            {incomeCategories.map((c) => (
              <CategoryRow key={c.id} category={c} onEdit={() => openEdit(c)} onDelete={() => handleDelete(c)} />
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <CategoryModal open onClose={() => setModalOpen(false)} onSaved={load} category={editing} />
      )}
    </div>
  );
}
