import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProductVariant } from '../types/product.types';

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(100, 'Max 100 characters'),
  color: z.string().max(50, 'Max 50 characters').optional(),
  size: z.string().max(50, 'Max 50 characters').optional(),
  price: z.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
  salePrice: z
    .number({ invalid_type_error: 'Sale price must be a number' })
    .positive('Sale price must be positive')
    .optional()
    .nullable(),
  stockQuantity: z.number({ invalid_type_error: 'Stock must be a number' }).int().min(0, 'Stock cannot be negative').optional(),
});

type VariantFormData = z.infer<typeof variantSchema>;

interface Props {
  defaultValues?: ProductVariant;
  onSubmit: (data: VariantFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ProductVariantForm({ defaultValues, onSubmit, onCancel, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: defaultValues?.sku ?? '',
      color: defaultValues?.color ?? '',
      size: defaultValues?.size ?? '',
      price: defaultValues?.price ?? undefined,
      salePrice: defaultValues?.salePrice ?? undefined,
      stockQuantity: defaultValues?.stockQuantity ?? 0,
    },
  });

  useEffect(() => {
    reset({
      sku: defaultValues?.sku ?? '',
      color: defaultValues?.color ?? '',
      size: defaultValues?.size ?? '',
      price: defaultValues?.price ?? undefined,
      salePrice: defaultValues?.salePrice ?? undefined,
      stockQuantity: defaultValues?.stockQuantity ?? 0,
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* SKU */}
      <div>
        <label htmlFor="var-sku" className="block text-sm font-medium text-gray-700 mb-1">
          SKU
        </label>
        <input
          {...register('sku')}
          id="var-sku"
          type="text"
          placeholder="e.g. TSH-RED-M"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Color */}
        <div>
          <label htmlFor="var-color" className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            {...register('color')}
            id="var-color"
            type="text"
            placeholder="e.g. Red"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Size */}
        <div>
          <label htmlFor="var-size" className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <input
            {...register('size')}
            id="var-size"
            type="text"
            placeholder="e.g. M"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Price */}
        <div>
          <label htmlFor="var-price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (VND)
          </label>
          <input
            {...register('price', { valueAsNumber: true })}
            id="var-price"
            type="number"
            min={0}
            step={1000}
            placeholder="250000"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
        </div>

        {/* Sale Price */}
        <div>
          <label htmlFor="var-sale" className="block text-sm font-medium text-gray-700 mb-1">
            Sale Price <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            {...register('salePrice', { valueAsNumber: true, setValueAs: (v) => (v === '' || isNaN(v) ? undefined : Number(v)) })}
            id="var-sale"
            type="number"
            min={0}
            step={1000}
            placeholder="200000"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.salePrice && (
            <p className="mt-1 text-xs text-red-500">{errors.salePrice.message}</p>
          )}
        </div>
      </div>

      {/* Stock */}
      <div>
        <label htmlFor="var-stock" className="block text-sm font-medium text-gray-700 mb-1">
          Stock Quantity
        </label>
        <input
          {...register('stockQuantity', { valueAsNumber: true })}
          id="var-stock"
          type="number"
          min={0}
          placeholder="0"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.stockQuantity && (
          <p className="mt-1 text-xs text-red-500">{errors.stockQuantity.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
