export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent: Category | null;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: number;
}
