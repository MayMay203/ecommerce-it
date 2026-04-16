import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useCategories } from './useCategories';
import { categoryService } from '../services/category.service';

vi.mock('../services/category.service', () => ({
  categoryService: {
    getAll: vi.fn(),
  },
}));

const mockGetAll = vi.mocked(categoryService.getAll);

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

const categoriesStub = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    parentId: null,
    parent: null,
    children: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Clothing',
    slug: 'clothing',
    parentId: null,
    parent: null,
    children: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockGetAll.mockResolvedValue({ data: categoriesStub, message: 'ok' });

    const { result } = renderHook(() => useCategories(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns categories data on successful fetch', async () => {
    mockGetAll.mockResolvedValue({ data: categoriesStub, message: 'ok' });

    const { result } = renderHook(() => useCategories(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(categoriesStub);
    expect(mockGetAll).toHaveBeenCalledOnce();
  });

  it('returns error state when API fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCategories(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });

  it('returns empty array when API returns no categories', async () => {
    mockGetAll.mockResolvedValue({ data: [], message: 'ok' });

    const { result } = renderHook(() => useCategories(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});
