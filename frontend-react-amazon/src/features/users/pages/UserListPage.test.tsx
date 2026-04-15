import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserListPage from './UserListPage';
import type { User } from '../types/user.types';

// Mock useUsers hook — page tests focus on rendering logic, not data fetching
vi.mock('../hooks/useUsers');
vi.mock('../hooks/useCreateUser', () => ({
  useCreateUser: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useUpdateUser', () => ({
  useUpdateUser: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useDeleteUser', () => ({
  useDeleteUser: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { useUsers } from '../hooks/useUsers';
const mockUseUsers = vi.mocked(useUsers);

const usersStub: User[] = [
  {
    id: 1,
    email: 'alice@example.com',
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
    email: 'bob@example.com',
    password: 'hashed',
    firstName: 'Bob',
    lastName: 'Customer',
    phone: null,
    isActive: false,
    roleId: 2,
    role: { id: 2, name: 'customer' },
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('UserListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  it('renders loading skeleton when isLoading is true', () => {
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useUsers>);

    const { container } = render(<UserListPage />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /users/i })).not.toBeInTheDocument();
  });

  it('renders error message when isError is true', () => {
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useUsers>);

    render(<UserListPage />);

    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
  });

  it('renders page title and user table when data loads', () => {
    mockUseUsers.mockReturnValue({
      data: usersStub,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUsers>);

    render(<UserListPage />);

    expect(screen.getByRole('heading', { name: /^users$/i })).toBeInTheDocument();
    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('Bob Customer')).toBeInTheDocument();
  });

  it('renders empty state when data is an empty array', () => {
    mockUseUsers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUsers>);

    render(<UserListPage />);

    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });
});
