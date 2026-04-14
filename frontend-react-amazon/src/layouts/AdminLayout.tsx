import { Outlet } from 'react-router';
import { useUiStore } from '@/shared/stores/ui.store';

export function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUiStore();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        } flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <span className="font-bold">Admin</span>}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-700 text-gray-300"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
        {/* TODO: add Sidebar navigation links */}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          {/* TODO: add AdminHeader component */}
          <span className="font-semibold text-gray-700">Admin Panel</span>
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
