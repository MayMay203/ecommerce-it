import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { CartIcon } from './CartIcon';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { CategoryNav } from './CategoryNav';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { WishlistIcon } from './WishlistIcon';

export function Header() {
  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <div className="bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 md:gap-6">
          <Link
            to={ROUTES.HOME}
            className="shrink-0 rounded border border-transparent px-2 py-1 hover:border-white/60"
            aria-label="Ecommerce — Home"
          >
            <span className="text-2xl font-bold tracking-tight text-white">
              Eco<span className="text-amber-400">mart</span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 md:flex">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1 md:gap-3">
            <UserMenu />
            <WishlistIcon />
            <CartIcon />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3 md:hidden">
          <SearchBar />
        </div>
      </div>

      <CategoryNav />
      <CartDrawer />
    </header>
  );
}
