import { PaginationMeta } from '../types/pagination.type';

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function getPaginationParams(
  page: number = 1,
  limit: number = 10,
): { skip: number; take: number } {
  const take = Math.min(limit, 100);
  const skip = (page - 1) * take;
  return { skip, take };
}
