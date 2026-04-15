import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateMeRequest,
} from '../types/auth.types';
import type { AuthUser } from '../types/auth.types';

export const authService = {
  register: (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> =>
    api.post<ApiResponse<RegisterResponse>>('/auth/register', data).then((res) => res.data),

  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data).then((res) => res.data),

  logout: (): Promise<ApiResponse<null>> =>
    api.post<ApiResponse<null>>('/auth/logout').then((res) => res.data),

  refresh: (): Promise<ApiResponse<RefreshResponse>> =>
    api.post<ApiResponse<RefreshResponse>>('/auth/refresh').then((res) => res.data),

  getMe: (): Promise<ApiResponse<AuthUser>> =>
    api.get<ApiResponse<AuthUser>>('/auth/me').then((res) => res.data),

  updateMe: (data: UpdateMeRequest): Promise<ApiResponse<AuthUser>> =>
    api.patch<ApiResponse<AuthUser>>('/auth/me', data).then((res) => res.data),

  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<null>> =>
    api.patch<ApiResponse<null>>('/auth/change-password', data).then((res) => res.data),
};
