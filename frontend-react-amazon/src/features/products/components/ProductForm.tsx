import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Category } from '@/features/categories/types/category.types';
import type { Product } from '../types/product.types';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Max 255 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(270, 'Max 270 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  categoryId: z.number().positive().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  defaultValues?: Product;
  categoryOptions: Pick<Category, 'id' | 'name'>[];
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function ProductForm({
  defaultValues,
  categoryOptions,
  onSubmit,
  onCancel,
  isLoading,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      categoryId: defaultValues?.categoryId ?? undefined,
      description: defaultValues?.description ?? '',
      thumbnailUrl: defaultValues?.thumbnailUrl ?? '',
      isActive: defaultValues?.isActive ?? true,
    },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      categoryId: defaultValues?.categoryId ?? undefined,
      description: defaultValues?.description ?? '',
      thumbnailUrl: defaultValues?.thumbnailUrl ?? '',
      isActive: defaultValues?.isActive ?? true,
    });
  }, [defaultValues, reset]);

  const nameValue = watch('name');
  useEffect(() => {
    if (!defaultValues) {
      setValue('slug', toSlug(nameValue), { shouldValidate: false });
    }
  }, [nameValue, defaultValues, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="prod-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          {...register('name')}
          id="prod-name"
          type="text"
          placeholder="e.g. Men's T-Shirt"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="prod-slug" className="block text-sm font-medium text-gray-700 mb-1">
          Slug
        </label>
        <input
          {...register('slug')}
          id="prod-slug"
          type="text"
          placeholder="e.g. mens-t-shirt"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="prod-category" className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <select
          {...register('categoryId', {
            setValueAs: (v) => (v === '' ? undefined : Number(v)),
          })}
          id="prod-category"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— None —</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="prod-desc" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          id="prod-desc"
          rows={3}
          placeholder="Product description…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Thumbnail URL */}
      <div>
        <label htmlFor="prod-thumb" className="block text-sm font-medium text-gray-700 mb-1">
          Thumbnail URL <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register('thumbnailUrl')}
          id="prod-thumb"
          type="text"
          placeholder="https://cdn.example.com/image.jpg"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.thumbnailUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.thumbnailUrl.message}</p>
        )}
      </div>

      {/* Active */}
      <div className="flex items-center gap-2">
        <input
          {...register('isActive')}
          id="prod-active"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="prod-active" className="text-sm font-medium text-gray-700">
          Active (visible to customers)
        </label>
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
