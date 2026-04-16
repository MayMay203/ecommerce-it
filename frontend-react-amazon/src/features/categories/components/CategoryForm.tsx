import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Category } from '../types/category.types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(120, 'Max 120 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  parentId: z.number().positive().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Props {
  defaultValues?: Category;
  parentOptions: Pick<Category, 'id' | 'name'>[];
  onSubmit: (data: CategoryFormData) => void;
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

export function CategoryForm({
  defaultValues,
  parentOptions,
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
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      parentId: defaultValues?.parentId ?? undefined,
    },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      parentId: defaultValues?.parentId ?? undefined,
    });
  }, [defaultValues, reset]);

  // Auto-generate slug from name when creating
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
        <label
          htmlFor="cat-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name
        </label>
        <input
          {...register('name')}
          id="cat-name"
          type="text"
          placeholder="e.g. Electronics"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="cat-slug"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Slug
        </label>
        <input
          {...register('slug')}
          id="cat-slug"
          type="text"
          placeholder="e.g. electronics"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.slug && (
          <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
        )}
      </div>

      {/* Parent */}
      <div>
        <label
          htmlFor="cat-parent"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Parent Category{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <select
          {...register('parentId', {
            setValueAs: (v) => (v === '' ? undefined : Number(v)),
          })}
          id="cat-parent"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— None —</option>
          {parentOptions
            .filter((p) => p.id !== defaultValues?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
        {errors.parentId && (
          <p className="mt-1 text-xs text-red-500">{errors.parentId.message}</p>
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
