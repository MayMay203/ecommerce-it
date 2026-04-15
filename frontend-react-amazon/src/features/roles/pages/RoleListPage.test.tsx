import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoleListPage from './RoleListPage';

// Mock useRoles hook — page tests focus on rendering logic, not data fetching
vi.mock('../hooks/useRoles');
vi.mock('../hooks/useCreateRole', () => ({
  useCreateRole: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useUpdateRole', () => ({
  useUpdateRole: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useDeleteRole', () => ({
  useDeleteRole: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { useRoles } from '../hooks/useRoles';
const mockUseRoles = vi.mocked(useRoles);

describe('RoleListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when isLoading is true', () => {
    mockUseRoles.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useRoles>);

    const { container } = render(<RoleListPage />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /roles/i })).not.toBeInTheDocument();
  });

  it('renders error message when isError is true', () => {
    mockUseRoles.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useRoles>);

    render(<RoleListPage />);

    expect(screen.getByText(/failed to load roles/i)).toBeInTheDocument();
  });

  it('renders page title and role table when data loads', () => {
    mockUseRoles.mockReturnValue({
      data: [
        { id: 1, name: 'admin' },
        { id: 2, name: 'customer' },
      ],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useRoles>);

    render(<RoleListPage />);

    expect(screen.getByRole('heading', { name: /^roles$/i })).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('customer')).toBeInTheDocument();
  });
});
