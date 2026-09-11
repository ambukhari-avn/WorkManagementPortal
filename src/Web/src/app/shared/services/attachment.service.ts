// src/Web/src/app/shared/services/attachment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attachment } from '../models/attachment.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private baseUrl = `${environment.apiUrl}/taskitems`;
    private apiOrigin = environment.apiUrl;

    getByTask(taskItemId: number): Observable<Attachment[]> {
        return this.http.get<Attachment[]>(`${this.baseUrl}/${taskItemId}/attachments`);
    }

    upload(taskItemId: number, file: File): Observable<Attachment> {
        const formData = new FormData();
        formData.append('file', file);
        const uploadedByUserId = this.authService.currentUser()?.sub;
        return this.http.post<Attachment>(
            `${this.baseUrl}/${taskItemId}/attachments?uploadedByUserId=${uploadedByUserId}`,
            formData
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/attachments/${id}`);
    }

    absoluteUrl(fileUrl: string): string {
        return fileUrl.startsWith('http') ? fileUrl : `${this.apiOrigin}${fileUrl}`;
    }

    download(attachmentId: number, fileName: string): void {
        this.http.get(`${this.apiOrigin}/attachments/${attachmentId}/download`, { responseType: 'blob' })
            .subscribe(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();
                window.URL.revokeObjectURL(url);
            });
    }
}