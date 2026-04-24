import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthUser } from '@/features/auth';

const editProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface Props {
  user: AuthUser;
  onSubmit: (data: EditProfileFormData) => void;
  isLoading: boolean;
  error?: string;
}

const fieldClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const errorClass = 'mt-1 text-xs text-red-500';

export function EditProfileForm({ user, onSubmit, isLoading, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            First Name
          </label>
          <input
            {...register('firstName')}
            id="firstName"
            type="text"
            placeholder="John"
            className={fieldClass}
          />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className={labelClass}>
            Last Name
          </label>
          <input
            {...register('lastName')}
            id="lastName"
            type="text"
            placeholder="Doe"
            className={fieldClass}
          />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone (Optional)
        </label>
        <input
          {...register('phone')}
          id="phone"
          type="tel"
          placeholder="0901234567"
          className={fieldClass}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}
