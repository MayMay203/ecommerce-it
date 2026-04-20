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
          { path: 'cart', element: <div>Cart Page — coming soon</div> },
          { path: 'checkout', element: <div>Checkout Page — coming soon</div> },
          { path: 'orders', element: <div>Orders Page — coming soon</div> },
          { path: 'orders/:id', element: <div>Order Detail Page — coming soon</div> },
          { path: 'profile', element: <div>Profile Page — coming soon</div> },
          { path: 'profile/addresses', element: <div>Addresses Page — coming soon</div> },
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
