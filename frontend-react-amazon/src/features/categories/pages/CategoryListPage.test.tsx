import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoryListPage from './CategoryListPage';

vi.mock('../hooks/useCategories');
vi.mock('../hooks/useCreateCategory', () => ({
  useCreateCategory: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useUpdateCategory', () => ({
  useUpdateCategory: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useDeleteCategory', () => ({
  useDeleteCategory: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { useCategories } from '../hooks/useCategories';
const mockUseCategories = vi.mocked(useCategories);

describe('CategoryListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  it('renders loading skeleton when isLoading is true', () => {
    mockUseCategories.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useCategories>);

    const { container } = render(<CategoryListPage />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /categories/i }),
    ).not.toBeInTheDocument();
  });

  it('renders error message when isError is true', () => {
    mockUseCategories.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useCategories>);

    render(<CategoryListPage />);

    expect(screen.getByText(/failed to load categories/i)).toBeInTheDocument();
  });

  it('renders page title and category table when data loads', () => {
    mockUseCategories.mockReturnValue({
      data: [
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
      ],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCategories>);

    render(<CategoryListPage />);

    expect(
      screen.getByRole('heading', { name: /^categories$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('renders empty table when data is an empty array', () => {
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCategories>);

    render(<CategoryListPage />);

    expect(
      screen.getByRole('heading', { name: /^categories$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no categories found/i)).toBeInTheDocument();
  });
});
