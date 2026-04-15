export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  roleId: number;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive?: boolean;
  roleId: number;
}

export interface UpdateUserRequest {
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  roleId?: number;
}
