// src/Web/src/app/shared/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private http = inject(HttpClient);

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    updateRole(userId: number, role: string): Observable<void> {
        return this.http.patch<void>(`${environment.apiUrl}/users/${userId}/role`, { role });
    }

    delete(userId: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/users/${userId}`);
    }
}

