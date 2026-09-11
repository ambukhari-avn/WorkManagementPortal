// src/Web/src/app/shared/models/task.model.ts
export interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: number;
  assignedToName: string | null;
}

export interface CreateTaskItem {
  title: string;
  description: string | null;
  priority: string;
  projectId: number;
  assignedToUserId: number | null;
}

export interface UpdateTaskItem {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}