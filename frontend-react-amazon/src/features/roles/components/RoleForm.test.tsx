import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleForm } from './RoleForm';

const defaultProps = {
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  isLoading: false,
};

describe('RoleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name input, Save and Cancel buttons', () => {
    render(<RoleForm {...defaultProps} />);

    expect(screen.getByLabelText(/role name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows "Name is required" when submitted with empty name', async () => {
    const user = userEvent.setup();
    render(<RoleForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows "Max 50 characters" when name exceeds 50 chars', async () => {
    const user = userEvent.setup();
    render(<RoleForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/role name/i), 'a'.repeat(51));
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Max 50 characters')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(<RoleForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/role name/i), 'moderator');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(defaultProps.onSubmit).toHaveBeenCalledOnce();
    // RHF calls onSubmit(data, event) — assert only on the data argument
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      { name: 'moderator' },
      expect.anything(),
    );
  });

  it('disables Save button and shows "Saving…" when isLoading is true', () => {
    render(<RoleForm {...defaultProps} isLoading={true} />);

    const saveBtn = screen.getByRole('button', { name: /saving/i });
    expect(saveBtn).toBeDisabled();
  });

  it('pre-fills input when defaultValues is provided', () => {
    render(
      <RoleForm
        {...defaultProps}
        defaultValues={{ id: 1, name: 'admin' }}
      />,
    );

    expect(screen.getByLabelText(/role name/i)).toHaveValue('admin');
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<RoleForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });
});
