import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface Props {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  error?: string;
}

const fieldClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const errorClass = 'mt-1 text-xs text-red-500';

export function LoginForm({ onSubmit, isLoading, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Sign in</h2>
        <p className="mt-1 text-sm text-gray-500">Welcome back — enter your credentials below.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className={labelClass}>
          Email
        </label>
        <input
          {...register('email')}
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="login-password" className={labelClass}>
          Password
        </label>
        <input
          {...register('password')}
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={fieldClass}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
