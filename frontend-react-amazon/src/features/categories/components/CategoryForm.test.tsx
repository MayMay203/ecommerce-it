import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryForm } from './CategoryForm';

const parentOptions = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Clothing' },
];

const defaultProps = {
  parentOptions,
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  isLoading: false,
};

describe('CategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name, slug, parent fields with Save and Cancel buttons', () => {
    render(<CategoryForm {...defaultProps} />);

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^slug$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows "Name is required" when submitted with empty name', async () => {
    const user = userEvent.setup();
    render(<CategoryForm {...defaultProps} />);

    // Clear the auto-generated slug then submit
    await user.clear(screen.getByLabelText(/^slug$/i));
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows "Slug is required" when slug is cleared and submitted', async () => {
    const user = userEvent.setup();
    render(<CategoryForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Books');
    await user.clear(screen.getByLabelText(/^slug$/i));
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Slug is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows slug validation error for invalid slug format', async () => {
    const user = userEvent.setup();
    render(<CategoryForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Test');
    await user.clear(screen.getByLabelText(/^slug$/i));
    await user.type(screen.getByLabelText(/^slug$/i), 'Invalid Slug!');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(
      await screen.findByText(/lowercase kebab-case/i),
    ).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('auto-generates slug from name when creating', async () => {
    const user = userEvent.setup();
    render(<CategoryForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Home Appliances');

    expect(screen.getByLabelText(/^slug$/i)).toHaveValue('home-appliances');
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(<CategoryForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Books');
    // slug is auto-filled as "books"
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(defaultProps.onSubmit).toHaveBeenCalledOnce();
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Books', slug: 'books' }),
      expect.anything(),
    );
  });

  it('disables Save button and shows "Saving…" when isLoading is true', () => {
    render(<CategoryForm {...defaultProps} isLoading={true} />);

    const saveBtn = screen.getByRole('button', { name: /saving/i });
    expect(saveBtn).toBeDisabled();
  });

  it('pre-fills fields when defaultValues is provided', () => {
    render(
      <CategoryForm
        {...defaultProps}
        defaultValues={{
          id: 3,
          name: 'Electronics',
          slug: 'electronics',
          parentId: null,
          parent: null,
          children: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByLabelText(/^name$/i)).toHaveValue('Electronics');
    expect(screen.getByLabelText(/^slug$/i)).toHaveValue('electronics');
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CategoryForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });

  it('renders parent options in the select', () => {
    render(<CategoryForm {...defaultProps} />);

    expect(screen.getByRole('option', { name: 'Electronics' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Clothing' })).toBeInTheDocument();
  });
});
