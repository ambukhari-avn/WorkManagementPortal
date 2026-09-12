// src/Web/src/app/shared/services/audit-log.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLog } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private http = inject(HttpClient);

  getByEntity(entityName: string, entityId: number): Observable<AuditLog[]> {
    const params = new HttpParams().set('entityName', entityName).set('entityId', entityId);
    return this.http.get<AuditLog[]>(`${environment.apiUrl}/audit-logs`, { params });
  }
}