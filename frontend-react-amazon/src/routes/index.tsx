import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const RoleListPage = lazy(() => import('@/features/roles/pages/RoleListPage'));
const UserListPage = lazy(() => import('@/features/users/pages/UserListPage'));

const routes: RouteObject[] = [
  // Public routes — MainLayout
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <div className="p-8 text-center"><h1 className="text-2xl font-bold">Welcome to Ecommerce</h1></div>,
      },
      {
        path: 'products',
        element: <div>Product List Page — coming soon</div>,
      },
      {
        path: 'products/:slug',
        element: <div>Product Detail Page — coming soon</div>,
      },
      {
        path: 'categories/:slug',
        element: <div>Category Page — coming soon</div>,
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
          { path: 'products', element: <div>Admin Products — coming soon</div> },
          { path: 'orders', element: <div>Admin Orders — coming soon</div> },
          { path: 'categories', element: <div>Admin Categories — coming soon</div> },
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
