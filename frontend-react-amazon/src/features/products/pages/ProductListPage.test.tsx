import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import ProductListPage from './ProductListPage';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';

vi.mock('../hooks/useProducts');
vi.mock('@/features/categories/hooks/useCategories');

const mockUseProducts = vi.mocked(useProducts);
const mockUseCategories = vi.mocked(useCategories);

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

const productsStub = [
  {
    id: 1,
    name: 'Test Product',
    slug: 'test-product',
    categoryId: null,
    category: null,
    description: null,
    thumbnailUrl: null,
    isActive: true,
    variants: [],
    images: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton when data is loading', () => {
    mockUseProducts.mockReturnValue({ isLoading: true, isError: false, data: undefined } as any);
    mockUseCategories.mockReturnValue({ isLoading: false, data: [] } as any);

    const { container } = render(<ProductListPage />, { wrapper: makeWrapper() });

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows error message when products fail to load', () => {
    mockUseProducts.mockReturnValue({ isLoading: false, isError: true, data: undefined } as any);
    mockUseCategories.mockReturnValue({ isLoading: false, data: [] } as any);

    render(<ProductListPage />, { wrapper: makeWrapper() });

    expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
  });

  it('renders page title when data is loaded', () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: productsStub,
    } as any);
    mockUseCategories.mockReturnValue({ isLoading: false, data: [] } as any);

    render(<ProductListPage />, { wrapper: makeWrapper() });

    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText(/manage product catalog/i)).toBeInTheDocument();
  });

  it('renders product list when data is available', () => {
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: productsStub,
    } as any);
    mockUseCategories.mockReturnValue({ isLoading: false, data: [] } as any);

    render(<ProductListPage />, { wrapper: makeWrapper() });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders empty state when no products', () => {
    mockUseProducts.mockReturnValue({ isLoading: false, isError: false, data: [] } as any);
    mockUseCategories.mockReturnValue({ isLoading: false, data: [] } as any);

    render(<ProductListPage />, { wrapper: makeWrapper() });

    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});
