import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CreateUserRequest, UpdateUserRequest, User } from '../types/user.types';

export const userService = {
  getAll: (): Promise<ApiResponse<User[]>> =>
    api.get<ApiResponse<User[]>>('/admin/users').then((res) => res.data),

  getById: (id: number): Promise<ApiResponse<User>> =>
    api.get<ApiResponse<User>>(`/admin/users/${id}`).then((res) => res.data),

  create: (data: CreateUserRequest): Promise<ApiResponse<User>> =>
    api.post<ApiResponse<User>>('/admin/users', data).then((res) => res.data),

  update: (id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/admin/users/${id}`).then(() => undefined),
};
