// src/Web/src/app/shared/services/task.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskItem, CreateTaskItem, UpdateTaskItem } from '../models/task.model';
import { PagedResult } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/taskitems`;

  getByProject(projectId: number, status?: string, priority?: string, search?: string, page = 1, pageSize = 10): Observable<PagedResult<TaskItem>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResult<TaskItem>>(`${this.baseUrl}/project/${projectId}`, { params });
  }

  getById(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateTaskItem): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateTaskItem): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}