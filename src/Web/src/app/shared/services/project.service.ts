// src/Web/src/app/shared/services/project.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, CreateProject, UpdateProject, ProjectMember, PagedResult } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/projects`;

  getAll(search?: string, isArchived?: boolean, page = 1, pageSize = 10): Observable<PagedResult<Project>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    if (isArchived !== undefined) params = params.set('isArchived', isArchived);
    return this.http.get<PagedResult<Project>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateProject): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateProject): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getMembers(id: number): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.baseUrl}/${id}/members`);
  }

  addMember(projectId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${projectId}/members/${userId}`, {});
  }

  removeMember(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}/members/${userId}`);
  }
}