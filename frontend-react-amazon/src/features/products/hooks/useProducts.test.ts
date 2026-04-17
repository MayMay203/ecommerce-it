import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useProducts } from './useProducts';
import { productService } from '../services/product.service';

vi.mock('../services/product.service', () => ({
  productService: {
    getAll: vi.fn(),
  },
}));

const mockGetAll = vi.mocked(productService.getAll);

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
    categoryId: 1,
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

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockGetAll.mockResolvedValue({ success: true, data: productsStub });

    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns products data on successful fetch', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: productsStub });

    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(productsStub);
    expect(mockGetAll).toHaveBeenCalledOnce();
  });

  it('returns error state when API fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });

  it('returns empty array when API returns no products', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});
