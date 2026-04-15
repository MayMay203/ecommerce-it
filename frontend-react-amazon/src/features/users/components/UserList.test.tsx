import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserList } from './UserList';
import type { User } from '../types/user.types';

// Mock mutation hooks — we test UI behaviour, not API calls
vi.mock('../hooks/useCreateUser', () => ({
  useCreateUser: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useUpdateUser', () => ({
  useUpdateUser: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useDeleteUser', () => ({
  useDeleteUser: () => ({ mutate: vi.fn(), isPending: false }),
}));

const users: User[] = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'hashed',
    firstName: 'Alice',
    lastName: 'Admin',
    phone: null,
    isActive: true,
    roleId: 1,
    role: { id: 1, name: 'admin' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    email: 'customer@example.com',
    password: 'hashed',
    firstName: 'Bob',
    lastName: 'Customer',
    phone: '+84 900 000 000',
    isActive: false,
    roleId: 2,
    role: { id: 2, name: 'customer' },
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('UserList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  it('renders "+ New User" button', () => {
    render(<UserList users={[]} />);
    expect(screen.getByRole('button', { name: /new user/i })).toBeInTheDocument();
  });

  it('renders empty state when users array is empty', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('renders a row for each user with name and email', () => {
    render(<UserList users={users} />);

    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Customer')).toBeInTheDocument();
    expect(screen.getByText('customer@example.com')).toBeInTheDocument();
  });

  it('renders role badge for each user', () => {
    render(<UserList users={users} />);

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('customer')).toBeInTheDocument();
  });

  it('renders Active/Inactive status badges correctly', () => {
    render(<UserList users={users} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders Edit and Delete buttons for each row', () => {
    render(<UserList users={users} />);

    expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2);
  });

  it('opens "Create User" modal when "+ New User" is clicked', async () => {
    const user = userEvent.setup();
    render(<UserList users={users} />);

    await user.click(screen.getByRole('button', { name: /new user/i }));

    expect(screen.getByRole('heading', { name: /create user/i })).toBeInTheDocument();
  });

  it('opens "Edit User" modal with pre-filled values when Edit is clicked', async () => {
    const user = userEvent.setup();
    render(<UserList users={users} />);

    const rows = screen.getAllByRole('row');
    // rows[0] = thead, rows[1] = first data row (Alice)
    const editBtn = within(rows[1]).getByRole('button', { name: /edit/i });
    await user.click(editBtn);

    expect(screen.getByRole('heading', { name: /edit user/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Alice');
  });

  it('calls window.confirm when Delete is clicked', async () => {
    const user = userEvent.setup();
    render(<UserList users={users} />);

    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalledOnce();
  });

  it('closes modal when Cancel is clicked inside the form', async () => {
    const user = userEvent.setup();
    render(<UserList users={users} />);

    await user.click(screen.getByRole('button', { name: /new user/i }));
    expect(screen.getByRole('heading', { name: /create user/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('heading', { name: /create user/i })).not.toBeInTheDocument();
  });
});
