import { useState } from 'react';
import type { Category } from '@/features/categories/types/category.types';
import { Pagination } from '@/shared/components/ui/Pagination';
import type { Product } from '../types/product.types';
import { ProductForm } from './ProductForm';
import { ProductVariantList } from './ProductVariantList';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { useUpdateProduct } from '../hooks/useUpdateProduct';
import { useDeleteProduct } from '../hooks/useDeleteProduct';

interface Props {
  products: Product[];
  categories: Category[];
}

type ModalState = { mode: 'create' } | { mode: 'edit'; product: Product };

const PAGE_SIZE = 10;

interface RowProps {
  product: Product;
  deletingId: number | null;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
  onManageVariants: (p: Product) => void;
}

function ProductRow({ product, deletingId, onEdit, onDelete, onManageVariants }: RowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
            No img
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 text-sm">{product.name}</div>
        <div className="font-mono text-xs text-gray-400">{product.slug}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {product.category?.name ?? <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            product.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{product.variants.length} variants</td>
      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
        <button
          onClick={() => onManageVariants(product)}
          className="rounded px-2 py-1 text-xs font-medium text-purple-600 border border-purple-200 hover:bg-purple-50"
        >
          Variants
        </button>
        <button
          onClick={() => onEdit(product)}
          className="rounded px-2 py-1 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product.id)}
          disabled={deletingId === product.id}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
        >
          {deletingId === product.id ? 'Deleting…' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}

export function ProductList({ products, categories }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [variantsProduct, setVariantsProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const paged = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSubmit(data: Parameters<typeof createProduct.mutate>[0]) {
    if (modal?.mode === 'create') {
      createProduct.mutate(data, { onSuccess: () => setModal(null) });
    } else if (modal?.mode === 'edit') {
      updateProduct.mutate(
        { id: modal.product.id, data },
        { onSuccess: () => setModal(null) },
      );
    }
  }

  function handleDelete(id: number) {
    if (!window.confirm('Delete this product? It will be marked as inactive.')) return;
    setDeletingId(id);
    deleteProduct.mutate(id, { onSettled: () => setDeletingId(null) });
  }

  const isMutating = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex justify-end">
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Product
        </button>
      </div>

      {/* Table card */}
      <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-16 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variants
                </th>
                <th className="w-48 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    No products found. Create one to get started.
                  </td>
                </tr>
              ) : (
                paged.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    deletingId={deletingId}
                    onEdit={(p) => setModal({ mode: 'edit', product: p })}
                    onDelete={handleDelete}
                    onManageVariants={(p) => setVariantsProduct(p)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={products.length}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Product create/edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {modal.mode === 'create' ? 'Create Product' : 'Edit Product'}
            </h2>
            <ProductForm
              defaultValues={modal.mode === 'edit' ? modal.product : undefined}
              categoryOptions={categories}
              onSubmit={handleSubmit}
              onCancel={() => setModal(null)}
              isLoading={isMutating}
            />
          </div>
        </div>
      )}

      {/* Variant management modal */}
      {variantsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Variants — {variantsProduct.name}
              </h2>
              <button
                onClick={() => setVariantsProduct(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <ProductVariantList
              productId={variantsProduct.id}
              variants={variantsProduct.variants}
            />
          </div>
        </div>
      )}
    </div>
  );
}
