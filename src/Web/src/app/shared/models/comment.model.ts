// src/Web/src/app/shared/models/comment.model.ts
export interface Comment {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface CreateComment {
  content: string;
  taskItemId: number;
  authorUserId: number;
}