import { useNavigate, Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useRegister } from '../hooks/useRegister';
import { RegisterForm } from '../components/RegisterForm';
import type { RegisterRequest } from '../types/auth.types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();

  async function handleSubmit(data: RegisterRequest) {
    register.mutate(data, {
      onSuccess: () => navigate(ROUTES.LOGIN, { replace: true }),
    });
  }

  const errorMessage =
    register.isError
      ? (register.error as { response?: { data?: { error?: { message?: string } } } })?.response
          ?.data?.error?.message ?? 'Registration failed. Please try again.'
      : undefined;

  return (
    <div className="space-y-4">
      <RegisterForm
        onSubmit={handleSubmit}
        isLoading={register.isPending}
        error={errorMessage}
      />
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
