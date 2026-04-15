import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(255),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    phone: z.string().max(20).optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface Props {
  onSubmit: (data: Omit<RegisterFormData, 'confirmPassword'>) => void;
  isLoading: boolean;
  error?: string;
}

const fieldClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const errorClass = 'mt-1 text-xs text-red-500';

export function RegisterForm({ onSubmit, isLoading, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  function handleFormSubmit({ confirmPassword: _cp, ...data }: RegisterFormData) {
    onSubmit({ ...data, phone: data.phone || undefined });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create account</h2>
        <p className="mt-1 text-sm text-gray-500">Join us — it only takes a minute.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="reg-email" className={labelClass}>
          Email
        </label>
        <input
          {...register('email')}
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="reg-first-name" className={labelClass}>
            First Name
          </label>
          <input
            {...register('firstName')}
            id="reg-first-name"
            type="text"
            placeholder="Alice"
            className={fieldClass}
          />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="reg-last-name" className={labelClass}>
            Last Name
          </label>
          <input
            {...register('lastName')}
            id="reg-last-name"
            type="text"
            placeholder="Smith"
            className={fieldClass}
          />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="reg-phone" className={labelClass}>
          Phone <span className="text-gray-400">(optional)</span>
        </label>
        <input
          {...register('phone')}
          id="reg-phone"
          type="text"
          placeholder="+84 900 000 000"
          className={fieldClass}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-password" className={labelClass}>
          Password
        </label>
        <input
          {...register('password')}
          id="reg-password"
          type="password"
          autoComplete="new-password"
          placeholder="Min 6 characters"
          className={fieldClass}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-confirm-password" className={labelClass}>
          Confirm Password
        </label>
        <input
          {...register('confirmPassword')}
          id="reg-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          className={fieldClass}
        />
        {errors.confirmPassword && (
          <p className={errorClass}>{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
