// src/Web/src/app/shared/services/comment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment, CreateComment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/taskitems`;

  getByTask(taskItemId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/${taskItemId}/comments`);
  }

  create(taskItemId: number, dto: CreateComment): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/${taskItemId}/comments`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/comments/${id}`);
  }
}