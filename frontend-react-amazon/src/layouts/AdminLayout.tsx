import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Package,
  List,
  ShoppingBag,
  Users,
  Lock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { useUiStore } from '@/shared/stores/ui.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/routes/routes';

// ── Nav config ────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  path: '/admin',                  icon: <LayoutDashboard size={20} />,  end: true },
  { label: 'Products',   path: ROUTES.ADMIN_PRODUCTS,     icon: <Package size={20} /> },
  { label: 'Categories', path: ROUTES.ADMIN_CATEGORIES,   icon: <List size={20} /> },
  { label: 'Orders',     path: ROUTES.ADMIN_ORDERS,       icon: <ShoppingBag size={20} /> },
  { label: 'Users',      path: ROUTES.ADMIN_USERS,        icon: <Users size={20} /> },
  { label: 'Roles',      path: ROUTES.ADMIN_ROLES,        icon: <Lock size={20} /> },
];

// ── Layout ────────────────────────────────────────────────────────────────────

export function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'A'
    : 'A';

  function handleLogout() {
    clear();
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      {/* ── Sidebar ── */}
      <aside
        className={`relative flex flex-col bg-gray-950 text-white transition-[width] duration-300 ease-in-out flex-shrink-0 ${
          sidebarOpen ? 'w-60' : 'w-[68px]'
        }`}
      >
        {/* Brand */}
        <div
          className={`flex items-center border-b border-white/10 h-16 px-4 gap-3 overflow-hidden`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
            A
          </div>
          {sidebarOpen && (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="font-semibold text-sm text-white truncate">Ecommerce</span>
              <span className="text-[11px] text-gray-400">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Toggle button — floats on the right edge */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="absolute -right-3 top-[22px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400 shadow-md hover:text-white hover:border-gray-500 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Nav section label */}
        {sidebarOpen && (
          <p className="mt-5 mb-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Menu
          </p>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              title={!sidebarOpen ? item.label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {sidebarOpen && isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Admin Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
