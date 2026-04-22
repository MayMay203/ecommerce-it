import { Outlet } from 'react-router';
import { Header } from '@/shared/components/layout/Header';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-slate-900 px-4 py-6 text-center text-sm text-gray-300">
        &copy; {new Date().getFullYear()} Ecomart — All rights reserved
      </footer>
    </div>
  );
}
