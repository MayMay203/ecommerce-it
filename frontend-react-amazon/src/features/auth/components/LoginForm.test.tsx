import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email, password fields and submit button', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error when email is empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when email format is invalid', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when password is too short', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), '123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'password123',
    });
  });

  it('disables submit button and shows loading text when isLoading is true', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);

    const btn = screen.getByRole('button', { name: /signing in/i });
    expect(btn).toBeDisabled();
  });

  it('displays API error message when error prop is provided', () => {
    render(
      <LoginForm onSubmit={mockOnSubmit} isLoading={false} error="Invalid credentials." />,
    );

    expect(screen.getByText('Invalid credentials.')).toBeInTheDocument();
  });
});
