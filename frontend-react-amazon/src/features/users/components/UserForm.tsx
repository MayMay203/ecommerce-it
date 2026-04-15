import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '../types/user.types';

const createUserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters').max(255),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
  roleId: z.number({ invalid_type_error: 'Role ID must be a number' }).min(1, 'Role is required'),
});

const editUserSchema = z.object({
  password: z.string().min(6, 'Min 6 characters').max(255).optional().or(z.literal('')),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
  roleId: z.number({ invalid_type_error: 'Role ID must be a number' }).min(1, 'Role is required'),
});

type CreateFormData = z.infer<typeof createUserSchema>;
type EditFormData = z.infer<typeof editUserSchema>;
type UserFormData = CreateFormData | EditFormData;

interface Props {
  defaultValues?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function UserForm({ defaultValues, onSubmit, onCancel, isLoading }: Props) {
  const isEditing = !!defaultValues;
  const schema = isEditing ? editUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          firstName: defaultValues.firstName,
          lastName: defaultValues.lastName,
          phone: defaultValues.phone ?? '',
          isActive: defaultValues.isActive,
          roleId: defaultValues.roleId,
          password: '',
        }
      : { isActive: true },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        firstName: defaultValues.firstName,
        lastName: defaultValues.lastName,
        phone: defaultValues.phone ?? '',
        isActive: defaultValues.isActive,
        roleId: defaultValues.roleId,
        password: '',
      });
    }
  }, [defaultValues, reset]);

  const fieldClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'mt-1 text-xs text-red-500';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email — create only */}
      {!isEditing && (
        <div>
          <label htmlFor="user-email" className={labelClass}>
            Email
          </label>
          <input
            {...register('email' as keyof UserFormData)}
            id="user-email"
            type="email"
            placeholder="john@example.com"
            className={fieldClass}
          />
          {'email' in errors && errors.email && (
            <p className={errorClass}>{errors.email.message}</p>
          )}
        </div>
      )}

      {/* Password */}
      <div>
        <label htmlFor="user-password" className={labelClass}>
          Password{isEditing && ' (leave blank to keep current)'}
        </label>
        <input
          {...register('password' as keyof UserFormData)}
          id="user-password"
          type="password"
          placeholder={isEditing ? '••••••' : 'Min 6 characters'}
          className={fieldClass}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
      </div>

      {/* First / Last name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="user-first-name" className={labelClass}>
            First Name
          </label>
          <input
            {...register('firstName')}
            id="user-first-name"
            type="text"
            placeholder="John"
            className={fieldClass}
          />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="user-last-name" className={labelClass}>
            Last Name
          </label>
          <input
            {...register('lastName')}
            id="user-last-name"
            type="text"
            placeholder="Doe"
            className={fieldClass}
          />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="user-phone" className={labelClass}>
          Phone <span className="text-gray-400">(optional)</span>
        </label>
        <input
          {...register('phone')}
          id="user-phone"
          type="text"
          placeholder="+84 900 000 000"
          className={fieldClass}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      {/* Role ID */}
      <div>
        <label htmlFor="user-role-id" className={labelClass}>
          Role ID
        </label>
        <input
          {...register('roleId', { valueAsNumber: true })}
          id="user-role-id"
          type="number"
          min={1}
          placeholder="e.g. 1"
          className={fieldClass}
        />
        {errors.roleId && <p className={errorClass}>{errors.roleId.message}</p>}
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-2">
        <input
          {...register('isActive')}
          id="user-is-active"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="user-is-active" className="text-sm text-gray-700">
          Active
        </label>
      </div>

      {/* Actions */}
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
