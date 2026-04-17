import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductForm } from './ProductForm';

const categoryOptions = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Clothing' },
];

describe('ProductForm', () => {
  it('renders all required fields', () => {
    render(
      <ProductForm
        categoryOptions={categoryOptions}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    render(
      <ProductForm
        categoryOptions={categoryOptions}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isLoading={false}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ProductForm
        categoryOptions={categoryOptions}
        onSubmit={vi.fn()}
        onCancel={onCancel}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables Save button when isLoading is true', () => {
    render(
      <ProductForm
        categoryOptions={categoryOptions}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isLoading={true}
      />,
    );

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('auto-generates slug from name when creating', async () => {
    render(
      <ProductForm
        categoryOptions={categoryOptions}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isLoading={false}
      />,
    );

    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'My New Product');

    await waitFor(() => {
      const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
      expect(slugInput.value).toBe('my-new-product');
    });
  });

  it('populates form with defaultValues when editing', () => {
    const defaultValues = {
      id: 1,
      name: 'Existing Product',
      slug: 'existing-product',
      categoryId: 1,
      category: null,
      description: 'A description',
      thumbnailUrl: null,
      isActive: true,
      variants: [],
      images: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    render(
      <ProductForm
        defaultValues={defaultValues}
        categoryOptions={categoryOptions}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isLoading={false}
      />,
    );

    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe('Existing Product');
    expect((screen.getByLabelText(/slug/i) as HTMLInputElement).value).toBe('existing-product');
  });

  it('calls onSubmit with valid data', async () => {
    const onSubmit = vi.fn();
    render(
      <ProductForm
        categoryOptions={categoryOptions}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isLoading={false}
      />,
    );

    await userEvent.type(screen.getByLabelText(/name/i), 'Great Product');

    await waitFor(() => {
      const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
      expect(slugInput.value).toBe('great-product');
    });

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Great Product', slug: 'great-product' }),
        expect.anything(),
      );
    });
  });
});
