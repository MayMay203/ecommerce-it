import { useState } from 'react';
import type { Role } from '../types/role.types';
import { RoleForm } from './RoleForm';
import { useCreateRole } from '../hooks/useCreateRole';
import { useUpdateRole } from '../hooks/useUpdateRole';
import { useDeleteRole } from '../hooks/useDeleteRole';

interface Props {
  roles: Role[];
}

type ModalState = { mode: 'create' } | { mode: 'edit'; role: Role };

export function RoleList({ roles }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  function handleSubmit(data: { name: string }) {
    if (modal?.mode === 'create') {
      createRole.mutate(data, { onSuccess: () => setModal(null) });
    } else if (modal?.mode === 'edit') {
      updateRole.mutate(
        { id: modal.role.id, data },
        { onSuccess: () => setModal(null) },
      );
    }
  }

  function handleDelete(id: number) {
    if (!window.confirm('Delete this role? This action cannot be undone.')) return;
    setDeletingId(id);
    deleteRole.mutate(id, { onSettled: () => setDeletingId(null) });
  }

  const isMutating = createRole.isPending || updateRole.isPending;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Role
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-16 px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="w-40 px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                  No roles found. Create one to get started.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{role.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{role.name}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => setModal({ mode: 'edit', role })}
                      className="rounded px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      disabled={deletingId === role.id}
                      className="rounded px-3 py-1 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === role.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
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
              {modal.mode === 'create' ? 'Create Role' : 'Edit Role'}
            </h2>
            <RoleForm
              defaultValues={modal.mode === 'edit' ? modal.role : undefined}
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
