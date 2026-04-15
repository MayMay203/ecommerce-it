import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserForm } from './UserForm';
import type { User } from '../types/user.types';

const defaultProps = {
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  isLoading: false,
};

const userStub: User = {
  id: 1,
  email: 'john@example.com',
  password: 'hashed',
  firstName: 'John',
  lastName: 'Doe',
  phone: null,
  isActive: true,
  roleId: 2,
  role: { id: 2, name: 'customer' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('UserForm — create mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all create-mode fields', () => {
    render(<UserForm {...defaultProps} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows "Invalid email" for malformed email', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows password min-length error', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/^password/i), '123');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/min 6 characters/i)).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByLabelText(/last name/i), 'Smith');
    await user.clear(screen.getByLabelText(/role id/i));
    await user.type(screen.getByLabelText(/role id/i), '2');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(defaultProps.onSubmit).toHaveBeenCalledOnce();
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        roleId: 2,
      }),
      expect.anything(),
    );
  });

  it('disables Save button and shows "Saving…" when isLoading is true', () => {
    render(<UserForm {...defaultProps} isLoading={true} />);

    const saveBtn = screen.getByRole('button', { name: /saving/i });
    expect(saveBtn).toBeDisabled();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });
});

describe('UserForm — edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does NOT render email field in edit mode', () => {
    render(<UserForm {...defaultProps} defaultValues={userStub} />);

    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it('shows password hint text in edit mode', () => {
    render(<UserForm {...defaultProps} defaultValues={userStub} />);

    expect(screen.getByText(/leave blank to keep current/i)).toBeInTheDocument();
  });

  it('pre-fills firstName, lastName, roleId from defaultValues', () => {
    render(<UserForm {...defaultProps} defaultValues={userStub} />);

    expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/role id/i)).toHaveValue(2);
  });

  it('pre-checks Active checkbox when user is active', () => {
    render(<UserForm {...defaultProps} defaultValues={userStub} />);

    expect(screen.getByLabelText(/active/i)).toBeChecked();
  });

  it('calls onSubmit without email when editing', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} defaultValues={userStub} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(defaultProps.onSubmit).toHaveBeenCalledOnce();
    const [submittedData] = defaultProps.onSubmit.mock.calls[0];
    expect(submittedData).not.toHaveProperty('email');
  });
});
