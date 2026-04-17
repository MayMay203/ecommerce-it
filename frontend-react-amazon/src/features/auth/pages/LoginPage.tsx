import { useNavigate, Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useLogin } from '../hooks/useLogin';
import { LoginForm } from '../components/LoginForm';
import type { LoginRequest } from '../types/auth.types';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();

  async function handleSubmit(data: LoginRequest) {
    login.mutate(data, {
      onSuccess: (res) => {
        const role = res.data.user.role;
        const dest = role === 'admin' || role === 'moderator'
          ? ROUTES.ADMIN_PRODUCTS
          : ROUTES.HOME;
        navigate(dest, { replace: true });
      },
    });
  }

  const errorMessage =
    login.isError
      ? (login.error as { response?: { data?: { error?: { message?: string } } } })?.response?.data
          ?.error?.message ?? 'Invalid credentials. Please try again.'
      : undefined;

  return (
    <div className="space-y-4">
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={login.isPending}
        error={errorMessage}
      />
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
