// src/Web/src/app/shared/models/project.model.ts
export interface Project {
  id: number;
  title: string;
  description: string | null;
  isArchived: boolean;
  createdByName: string;
  createdAt: string;
}

export interface CreateProject {
  title: string;
  description: string | null;
  createdByUserId: number;
}

export interface UpdateProject {
  title?: string;
  description?: string;
  isArchived?: boolean;
}

export interface ProjectMember {
  userId: number;
  fullName: string;
  email: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}