import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const RoleListPage = lazy(() => import('@/features/roles/pages/RoleListPage'));
const UserListPage = lazy(() => import('@/features/users/pages/UserListPage'));
const CategoryListPage = lazy(() => import('@/features/categories/pages/CategoryListPage'));
const AdminProductListPage = lazy(() => import('@/features/products/pages/ProductListPage'));
const UserProductListPage = lazy(() => import('@/features/product/pages/ProductListPage'));
const UserProductDetailPage = lazy(() => import('@/features/product/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'));
const WishlistPage = lazy(() => import('@/features/wishlist/pages/WishlistPage'));
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'));
const ProfilePage = lazy(() => import('@/features/user-profile/pages/ProfilePage'));
const AddressListPage = lazy(() => import('@/features/user-profile/pages/AddressListPage'));
const OrderListPage = lazy(() => import('@/features/order/pages/OrderListPage'));
const OrderDetailPage = lazy(() => import('@/features/order/pages/OrderDetailPage'));

const routes: RouteObject[] = [
  // Public routes — MainLayout
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
            <UserProductListPage />
          </Suspense>
        ),
      },
      {
        path: 'products/:slug',
        element: (
          <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
            <UserProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'categories/:slug',
        element: (
          <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
            <UserProductListPage />
          </Suspense>
        ),
      },
    ],
  },

  // Auth routes — AuthLayout
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },

  // Protected routes — requires auth
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: 'cart',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <CartPage />
              </Suspense>
            ),
          },
          {
            path: 'wishlist',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <WishlistPage />
              </Suspense>
            ),
          },
          {
            path: 'checkout',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <CheckoutPage />
              </Suspense>
            ),
          },
          {
            path: 'orders',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <OrderListPage />
              </Suspense>
            ),
          },
          {
            path: 'orders/:id',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <OrderDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: 'profile/addresses',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <AddressListPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // Admin routes — requires admin role
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'products',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <AdminProductListPage />
              </Suspense>
            ),
          },
          { path: 'orders', element: <div>Admin Orders — coming soon</div> },
          {
            path: 'categories',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <CategoryListPage />
              </Suspense>
            ),
          },
          {
            path: 'roles',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <RoleListPage />
              </Suspense>
            ),
          },
          {
            path: 'users',
            element: (
              <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
                <UserListPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
