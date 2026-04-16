import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

export const categoryService = {
  getAll: (): Promise<ApiResponse<Category[]>> =>
    api.get<ApiResponse<Category[]>>('/categories').then((res) => res.data),

  getById: (id: number): Promise<ApiResponse<Category>> =>
    api.get<ApiResponse<Category>>(`/categories/${id}`).then((res) => res.data),

  create: (data: CreateCategoryRequest): Promise<ApiResponse<Category>> =>
    api
      .post<ApiResponse<Category>>('/categories', data)
      .then((res) => res.data),

  update: (
    id: number,
    data: UpdateCategoryRequest,
  ): Promise<ApiResponse<Category>> =>
    api
      .patch<ApiResponse<Category>>(`/categories/${id}`, data)
      .then((res) => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/categories/${id}`).then(() => undefined),
};
