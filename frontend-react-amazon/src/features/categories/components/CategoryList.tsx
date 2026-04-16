import { useState } from 'react';
import type { Category } from '../types/category.types';
import { CategoryForm } from './CategoryForm';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useUpdateCategory } from '../hooks/useUpdateCategory';
import { useDeleteCategory } from '../hooks/useDeleteCategory';

interface Props {
  categories: Category[];
}

type ModalState = { mode: 'create' } | { mode: 'edit'; category: Category };

function flattenForParentOptions(categories: Category[]): Category[] {
  const result: Category[] = [];
  function walk(items: Category[]) {
    for (const item of items) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  }
  walk(categories);
  return result;
}

interface RowProps {
  category: Category;
  isChild: boolean;
  deletingId: number | null;
  onEdit: (cat: Category) => void;
  onDelete: (id: number) => void;
}

function CategoryRow({ category, isChild, deletingId, onEdit, onDelete }: RowProps) {
  return (
    <tr className={isChild ? 'hover:bg-blue-50/30' : 'bg-gray-50/60 hover:bg-gray-100/60'}>
      <td className="px-6 py-3">
        {isChild ? (
          <div className="flex items-center gap-2 pl-6">
            <span className="text-gray-300 select-none">└</span>
            <span className="text-gray-800 text-sm">{category.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">{category.name}</span>
            {category.children?.length > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                {category.children.length} sub
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-3 font-mono text-xs text-gray-400">
        {category.slug}
      </td>
      <td className="px-6 py-3 text-right whitespace-nowrap space-x-2">
        <button
          onClick={() => onEdit(category)}
          className="rounded px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(category.id)}
          disabled={deletingId === category.id}
          className="rounded px-3 py-1 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
        >
          {deletingId === category.id ? 'Deleting…' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}

export function CategoryList({ categories }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const allFlat = flattenForParentOptions(categories);

  function handleSubmit(data: { name: string; slug: string; parentId?: number }) {
    if (modal?.mode === 'create') {
      createCategory.mutate(data, { onSuccess: () => setModal(null) });
    } else if (modal?.mode === 'edit') {
      updateCategory.mutate(
        { id: modal.category.id, data },
        { onSuccess: () => setModal(null) },
      );
    }
  }

  function handleDelete(id: number) {
    if (!window.confirm('Delete this category? This action cannot be undone.'))
      return;
    setDeletingId(id);
    deleteCategory.mutate(id, { onSettled: () => setDeletingId(null) });
  }

  const isMutating = createCategory.isPending || updateCategory.isPending;
  const isEmpty = categories.length === 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Category
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="w-40 px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isEmpty ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                  No categories found. Create one to get started.
                </td>
              </tr>
            ) : (
              categories.map((root) => (
                <>
                  <CategoryRow
                    key={root.id}
                    category={root}
                    isChild={false}
                    deletingId={deletingId}
                    onEdit={(cat) => setModal({ mode: 'edit', category: cat })}
                    onDelete={handleDelete}
                  />
                  {root.children?.map((child) => (
                    <CategoryRow
                      key={child.id}
                      category={child}
                      isChild={true}
                      deletingId={deletingId}
                      onEdit={(cat) => setModal({ mode: 'edit', category: cat })}
                      onDelete={handleDelete}
                    />
                  ))}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {modal.mode === 'create' ? 'Create Category' : 'Edit Category'}
            </h2>
            <CategoryForm
              defaultValues={modal.mode === 'edit' ? modal.category : undefined}
              parentOptions={allFlat}
              onSubmit={handleSubmit}
              onCancel={() => setModal(null)}
              isLoading={isMutating}
            />
          </div>
        </div>
      )}
    </div>
  );
}
