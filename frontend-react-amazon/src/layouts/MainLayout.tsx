import { Outlet } from 'react-router';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="w-full flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">Ecommerce</span>
          {/* TODO: add Header component from shared/components/layout */}
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
        {/* TODO: add Footer component from shared/components/layout */}
        &copy; {new Date().getFullYear()} Ecommerce
      </footer>
    </div>
  );
}
