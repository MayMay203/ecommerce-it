import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <span className="text-2xl font-bold text-gray-900">Ecommerce</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
