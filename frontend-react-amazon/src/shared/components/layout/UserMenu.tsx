import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useAuthStore, useLogout } from '@/features/auth';

export function UserMenu() {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function handleLogout() {
    setOpen(false);
    logout.mutate(undefined, {
      onSettled: () => navigate(ROUTES.HOME),
    });
  }

  if (!isAuthenticated) {
    return (
      <Link
        to={ROUTES.LOGIN}
        className="flex flex-col rounded-md border border-transparent px-2 py-1 text-white hover:border-white/60"
      >
        <span className="text-xs text-gray-300">Hello, sign in</span>
        <span className="text-sm font-semibold">Account &amp; Lists</span>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex flex-col rounded-md border border-transparent px-2 py-1 text-left text-white hover:border-white/60"
      >
        <span className="text-xs text-gray-300">Hello, {user?.firstName ?? 'there'}</span>
        <span className="text-sm font-semibold">Account &amp; Lists ▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white text-gray-800 shadow-xl"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <MenuLink to={ROUTES.PROFILE} onClick={() => setOpen(false)}>
            Your Profile
          </MenuLink>
          <MenuLink to={ROUTES.ORDERS} onClick={() => setOpen(false)}>
            Your Orders
          </MenuLink>
          <MenuLink to={ROUTES.ADDRESSES} onClick={() => setOpen(false)}>
            Your Addresses
          </MenuLink>
          {user?.role === 'admin' && (
            <MenuLink to={ROUTES.ADMIN_PRODUCTS} onClick={() => setOpen(false)}>
              Admin Dashboard
            </MenuLink>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="block w-full border-t border-gray-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {logout.isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      className="block px-4 py-2.5 text-sm hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}
