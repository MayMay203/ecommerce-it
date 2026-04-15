import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useLogin } from './useLogin';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import * as axiosLib from '@/shared/lib/axios';

vi.mock('../services/auth.service', () => ({
  authService: { login: vi.fn() },
}));

vi.mock('@/shared/lib/axios', () => ({
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
  api: { post: vi.fn(), get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const mockLogin = vi.mocked(authService.login);
const mockSetAccessToken = vi.mocked(axiosLib.setAccessToken);

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

const loginResponseStub = {
  success: true,
  data: {
    accessToken: 'jwt_access',
    user: { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith', role: 'customer' },
  },
};

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('sets access token and user in store on success', async () => {
    mockLogin.mockResolvedValue(loginResponseStub);

    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: 'alice@example.com', password: 'password123' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetAccessToken).toHaveBeenCalledWith('jwt_access');
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(user?.email).toBe('alice@example.com');
  });

  it('sets error state on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: 'bad@example.com', password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockSetAccessToken).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});
