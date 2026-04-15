import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useRoles } from './useRoles';
import { roleService } from '../services/role.service';

vi.mock('../services/role.service', () => ({
  roleService: {
    getAll: vi.fn(),
  },
}));

const mockGetAll = vi.mocked(roleService.getAll);

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('useRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockGetAll.mockResolvedValue({ success: true, data: [], message: 'ok' });

    const { result } = renderHook(() => useRoles(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns roles data on successful fetch', async () => {
    const roles = [{ id: 1, name: 'admin' }, { id: 2, name: 'customer' }];
    mockGetAll.mockResolvedValue({ success: true, data: roles, message: 'ok' });

    const { result } = renderHook(() => useRoles(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(roles);
    expect(mockGetAll).toHaveBeenCalledOnce();
  });

  it('returns error state when API fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRoles(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});
