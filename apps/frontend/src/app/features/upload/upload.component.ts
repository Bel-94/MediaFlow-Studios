import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';

interface UploadItem { file: File; progress: number; status: 'pending' | 'uploading' | 'done' | 'error'; }
interface UploadUrlResponse { url: string; key: string; workspaceId: string; filePath: string; }

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <input type="file" multiple (change)="onSelect($event)" />
    <ul>
      <li *ngFor="let item of queue">{{ item.file.name }} — {{ item.progress }}% ({{ item.status }})</li>
    </ul>
  `,
})
export class UploadComponent {
  queue: UploadItem[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}

  onSelect(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    files.forEach(file => this.queue.push({ file, progress: 0, status: 'pending' }));
    this.queue.filter(i => i.status === 'pending').forEach(item => this.upload(item));
  }

  private upload(item: UploadItem): void {
    item.status = 'uploading';
    const workspaceId = 'default';

    this.http.post<UploadUrlResponse>(`${environment.apiUrl}/files/upload`, {
      fileName: item.file.name,
      contentType: item.file.type || 'application/octet-stream',
      workspaceId,
    }, {
      headers: { Authorization: `Bearer ${this.auth.getIdToken()}` },
    }).subscribe({
      next: ({ url }) => {
        this.http.put(url, item.file, {
          headers: { 'Content-Type': item.file.type || 'application/octet-stream' },
          reportProgress: true,
          observe: 'events',
        }).subscribe({
          next: event => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              item.progress = Math.round((event.loaded / event.total) * 100);
            }
            if (event.type === HttpEventType.Response) {
              item.progress = 100;
              item.status = 'done';
            }
          },
          error: () => { item.status = 'error'; },
        });
      },
      error: () => { item.status = 'error'; },
    });
  }
}
