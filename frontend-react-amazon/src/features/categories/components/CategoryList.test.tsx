import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryList } from './CategoryList';

vi.mock('../hooks/useCreateCategory', () => ({
  useCreateCategory: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useUpdateCategory', () => ({
  useUpdateCategory: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useDeleteCategory', () => ({
  useDeleteCategory: () => ({ mutate: vi.fn(), isPending: false }),
}));

const categories = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    parentId: null,
    parent: null,
    children: [
      {
        id: 3,
        name: 'Phones',
        slug: 'phones',
        parentId: 1,
        parent: { id: 1, name: 'Electronics', slug: 'electronics', parentId: null, parent: null, children: [], createdAt: '', updatedAt: '' },
        children: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
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

describe('CategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  it('renders "+ New Category" button', () => {
    render(<CategoryList categories={[]} />);
    expect(
      screen.getByRole('button', { name: /new category/i }),
    ).toBeInTheDocument();
  });

  it('renders empty state when categories array is empty', () => {
    render(<CategoryList categories={[]} />);
    expect(screen.getByText(/no categories found/i)).toBeInTheDocument();
  });

  it('renders a row for each category including children', () => {
    render(<CategoryList categories={categories} />);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Phones')).toBeInTheDocument();
    // 3 rows → 3 Edit buttons
    expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(3);
  });

  it('renders slug in monospace column', () => {
    render(<CategoryList categories={categories} />);
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('clothing')).toBeInTheDocument();
  });

  it('shows sub-category count badge on root categories that have children', () => {
    render(<CategoryList categories={categories} />);
    expect(screen.getByText('1 sub')).toBeInTheDocument();
  });

  it('opens "Create Category" modal when "+ New Category" is clicked', async () => {
    const user = userEvent.setup();
    render(<CategoryList categories={categories} />);

    await user.click(screen.getByRole('button', { name: /new category/i }));

    expect(
      screen.getByRole('heading', { name: /create category/i }),
    ).toBeInTheDocument();
  });

  it('opens "Edit Category" modal with pre-filled values when Edit is clicked', async () => {
    const user = userEvent.setup();
    render(<CategoryList categories={categories} />);

    const rows = screen.getAllByRole('row');
    // rows[0] = thead, rows[1] = Electronics row
    const editBtn = within(rows[1]).getByRole('button', { name: /edit/i });
    await user.click(editBtn);

    expect(
      screen.getByRole('heading', { name: /edit category/i }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument();
    expect(screen.getByDisplayValue('electronics')).toBeInTheDocument();
  });

  it('calls window.confirm when Delete is clicked', async () => {
    const user = userEvent.setup();
    render(<CategoryList categories={categories} />);

    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalledOnce();
  });

  it('closes modal when Cancel is clicked inside the form', async () => {
    const user = userEvent.setup();
    render(<CategoryList categories={categories} />);

    await user.click(screen.getByRole('button', { name: /new category/i }));
    expect(
      screen.getByRole('heading', { name: /create category/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(
      screen.queryByRole('heading', { name: /create category/i }),
    ).not.toBeInTheDocument();
  });
});
