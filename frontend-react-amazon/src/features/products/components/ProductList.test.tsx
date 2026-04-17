import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { ProductList } from './ProductList';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { useUpdateProduct } from '../hooks/useUpdateProduct';
import { useDeleteProduct } from '../hooks/useDeleteProduct';

vi.mock('../hooks/useCreateProduct');
vi.mock('../hooks/useUpdateProduct');
vi.mock('../hooks/useDeleteProduct');

const mockUseCreateProduct = vi.mocked(useCreateProduct);
const mockUseUpdateProduct = vi.mocked(useUpdateProduct);
const mockUseDeleteProduct = vi.mocked(useDeleteProduct);

const mutationStub = () => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
});

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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

describe('ProductList', () => {
  beforeEach(() => {
    mockUseCreateProduct.mockReturnValue(mutationStub() as any);
    mockUseUpdateProduct.mockReturnValue(mutationStub() as any);
    mockUseDeleteProduct.mockReturnValue(mutationStub() as any);
  });

  it('renders product rows', () => {
    render(<ProductList products={productsStub} categories={[]} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('test-product')).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    render(<ProductList products={[]} categories={[]} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it('opens create modal when New Product is clicked', () => {
    render(<ProductList products={[]} categories={[]} />, {
      wrapper: makeWrapper(),
    });

    fireEvent.click(screen.getByText('+ New Product'));
    expect(screen.getByText('Create Product')).toBeInTheDocument();
  });

  it('closes modal when Cancel is clicked', () => {
    render(<ProductList products={[]} categories={[]} />, {
      wrapper: makeWrapper(),
    });

    fireEvent.click(screen.getByText('+ New Product'));
    expect(screen.getByText('Create Product')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText('Create Product')).not.toBeInTheDocument();
  });

  it('shows active badge for active products', () => {
    render(<ProductList products={productsStub} categories={[]} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows inactive badge for inactive products', () => {
    const inactiveProduct = { ...productsStub[0], isActive: false };
    render(<ProductList products={[inactiveProduct]} categories={[]} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});
