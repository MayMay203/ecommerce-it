import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useUsers } from './useUsers';
import { userService } from '../services/user.service';
import type { User } from '../types/user.types';

vi.mock('../services/user.service', () => ({
  userService: {
    getAll: vi.fn(),
  },
}));

const mockGetAll = vi.mocked(userService.getAll);

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

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
];

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockGetAll.mockResolvedValue({ data: usersStub, message: 'ok' });

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns users data on successful fetch', async () => {
    mockGetAll.mockResolvedValue({ data: usersStub, message: 'ok' });

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(usersStub);
    expect(mockGetAll).toHaveBeenCalledOnce();
  });

  it('returns empty array when API returns empty data', async () => {
    mockGetAll.mockResolvedValue({ data: [], message: 'ok' });

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('returns error state when API fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});
