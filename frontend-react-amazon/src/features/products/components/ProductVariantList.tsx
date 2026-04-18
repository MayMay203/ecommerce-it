import { useState } from 'react';
import type { ProductVariant } from '../types/product.types';
import { ProductVariantForm } from './ProductVariantForm';
import { useCreateProductVariant } from '../hooks/useCreateProductVariant';
import { useUpdateProductVariant } from '../hooks/useUpdateProductVariant';
import { useDeleteProductVariant } from '../hooks/useDeleteProductVariant';
import { ConfirmModal } from '@/shared/components/ui/ConfirmModal';
import { AlertModal } from '@/shared/components/ui/AlertModal';
import { getApiErrorMessage } from '@/shared/utils/error.utils';

interface Props {
  productId: number;
  variants: ProductVariant[];
}

type ModalState = { mode: 'create' } | { mode: 'edit'; variant: ProductVariant };
type ConfirmDeleteState = { id: number; sku: string };

function formatPrice(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function ProductVariantList({ productId, variants }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createVariant = useCreateProductVariant(productId);
  const updateVariant = useUpdateProductVariant();
  const deleteVariant = useDeleteProductVariant();

  function handleSubmit(data: Parameters<typeof createVariant.mutate>[0]) {
    if (modal?.mode === 'create') {
      createVariant.mutate(data, {
        onSuccess: () => setModal(null),
        onError: (err) =>
          setErrorMessage(getApiErrorMessage(err, 'Failed to create variant. Please try again.')),
      });
    } else if (modal?.mode === 'edit') {
      updateVariant.mutate(
        { id: modal.variant.id, data },
        {
          onSuccess: () => setModal(null),
          onError: (err) =>
            setErrorMessage(getApiErrorMessage(err, 'Failed to update variant. Please try again.')),
        },
      );
    }
  }

  function handleDelete(id: number) {
    const variant = variants.find((v) => v.id === id);
    setConfirmDelete({ id, sku: variant?.sku ?? `#${id}` });
  }

  function confirmDeleteAction() {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setConfirmDelete(null);
    setDeletingId(id);
    deleteVariant.mutate(id, {
      onSettled: () => setDeletingId(null),
      onError: (err) =>
        setErrorMessage(getApiErrorMessage(err, 'Failed to delete variant. Please try again.')),
    });
  }

  const isMutating = createVariant.isPending || updateVariant.isPending;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Variants</h3>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="rounded px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50"
        >
          + Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">No variants yet.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-100 text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="py-1 text-left font-medium">SKU</th>
              <th className="py-1 text-left font-medium">Color</th>
              <th className="py-1 text-left font-medium">Size</th>
              <th className="py-1 text-right font-medium">Price</th>
              <th className="py-1 text-right font-medium">Stock</th>
              <th className="py-1 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {variants.map((v) => (
              <tr key={v.id}>
                <td className="py-1 font-mono text-gray-700">{v.sku}</td>
                <td className="py-1 text-gray-600">{v.color ?? '—'}</td>
                <td className="py-1 text-gray-600">{v.size ?? '—'}</td>
                <td className="py-1 text-right text-gray-700">
                  {v.salePrice ? (
                    <span>
                      <span className="line-through text-gray-400 mr-1">{formatPrice(v.price)}</span>
                      <span className="text-green-600">{formatPrice(v.salePrice)}</span>
                    </span>
                  ) : (
                    formatPrice(v.price)
                  )}
                </td>
                <td className="py-1 text-right text-gray-700">{v.stockQuantity}</td>
                <td className="py-1 text-right space-x-1">
                  <button
                    onClick={() => setModal({ mode: 'edit', variant: v })}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {modal.mode === 'create' ? 'Add Variant' : 'Edit Variant'}
            </h2>
            <ProductVariantForm
              defaultValues={modal.mode === 'edit' ? modal.variant : undefined}
              onSubmit={handleSubmit}
              onCancel={() => setModal(null)}
              isLoading={isMutating}
            />
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Variant"
          message={`Are you sure you want to delete variant "${confirmDelete.sku}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {errorMessage && (
        <AlertModal
          title="Operation Failed"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
}
