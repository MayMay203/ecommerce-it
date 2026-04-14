import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CreateRoleRequest, Role, UpdateRoleRequest } from '../types/role.types';

export const roleService = {
  getAll: (): Promise<ApiResponse<Role[]>> =>
    api.get<ApiResponse<Role[]>>('/admin/roles').then((res) => res.data),

  getById: (id: number): Promise<ApiResponse<Role>> =>
    api.get<ApiResponse<Role>>(`/admin/roles/${id}`).then((res) => res.data),

  create: (data: CreateRoleRequest): Promise<ApiResponse<Role>> =>
    api.post<ApiResponse<Role>>('/admin/roles', data).then((res) => res.data),

  update: (id: number, data: UpdateRoleRequest): Promise<ApiResponse<Role>> =>
    api.patch<ApiResponse<Role>>(`/admin/roles/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/admin/roles/${id}`).then(() => undefined),
};
