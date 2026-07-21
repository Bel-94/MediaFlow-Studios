import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { FileSizePipe } from '../../shared/file-size.pipe';

interface UploadItem {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  message?: string;
}

interface UploadUrlResponse {
  url: string;
  key: string;
  workspaceId: string;
  filePath: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    FileSizePipe,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <p class="eyebrow">Ingest</p>
        <h1>Upload assets</h1>
        <p class="sub">
          Files upload directly to S3 via a pre-signed URL. Metadata appears in Workspace
          a few seconds after processing.
        </p>
      </header>

      <div
        class="dropzone"
        [class.active]="dragging"
        (dragover)="onDragOver($event)"
        (dragleave)="dragging = false"
        (drop)="onDrop($event)"
      >
        <p>Drop files here, or choose from disk</p>
        <input #fileInput type="file" multiple hidden (change)="onSelect($event)" />
        <button mat-flat-button color="primary" type="button" (click)="fileInput.click()">
          Select files
        </button>
      </div>

      @if (queue.length) {
        <mat-nav-list class="queue">
          @for (item of queue; track item.file.name + item.file.size) {
            <div mat-list-item class="queue-item">
              <div class="meta">
                <strong>{{ item.file.name }}</strong>
                <span>{{ item.file.size | fileSize }} · {{ item.status }}</span>
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="item.progress"
                [color]="item.status === 'error' ? 'warn' : 'primary'"
              ></mat-progress-bar>
              @if (item.message) {
                <small class="msg">{{ item.message }}</small>
              }
            </div>
          }
        </mat-nav-list>

        <a mat-stroked-button routerLink="/workspace">Open workspace</a>
      }
    </section>
  `,
  styles: [`
    .page-header { margin-bottom: 1.25rem; }

    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.7rem;
      color: #0e7490;
      font-weight: 600;
      margin-bottom: 0.35rem;
    }

    h1 {
      font-family: "Source Serif 4", Georgia, serif;
      font-size: 2rem;
      color: #0f2744;
      font-weight: 600;
      margin-bottom: 0.35rem;
    }

    .sub { color: #475569; max-width: 36rem; line-height: 1.45; }

    .dropzone {
      border: 1.5px dashed rgba(14, 116, 144, 0.45);
      border-radius: 0.85rem;
      padding: 2.5rem 1.5rem;
      text-align: center;
      background: rgba(255, 255, 255, 0.7);
      display: grid;
      gap: 1rem;
      place-items: center;
      margin-bottom: 1.25rem;
      transition: background 160ms ease, border-color 160ms ease;
    }

    .dropzone.active {
      background: rgba(14, 116, 144, 0.08);
      border-color: #0e7490;
    }

    .queue {
      background: rgba(255, 255, 255, 0.78);
      border-radius: 0.75rem;
      border: 1px solid rgba(15, 39, 68, 0.08);
      margin-bottom: 1rem;
      padding: 0.5rem 0;
    }

    .queue-item {
      display: grid !important;
      gap: 0.4rem;
      height: auto !important;
      padding: 0.85rem 1rem !important;
    }

    .meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      color: #334155;
    }

    .meta span { color: #64748b; font-size: 0.85rem; }
    .msg { color: #b91c1c; }
  `],
})
export class UploadComponent {
  queue: UploadItem[] = [];
  dragging = false;
  private readonly workspaceId = 'default';

  constructor(private http: HttpClient, private auth: AuthService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.enqueue(files);
  }

  onSelect(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.enqueue(files);
    (event.target as HTMLInputElement).value = '';
  }

  private enqueue(files: File[]): void {
    files.forEach((file) => {
      const item: UploadItem = { file, progress: 0, status: 'pending' };
      this.queue = [item, ...this.queue];
      this.upload(item);
    });
  }

  private upload(item: UploadItem): void {
    item.status = 'uploading';
    this.http.post<UploadUrlResponse>(`${environment.apiUrl}/files/upload`, {
      fileName: item.file.name,
      contentType: item.file.type || 'application/octet-stream',
      workspaceId: this.workspaceId,
    }, {
      headers: { Authorization: `Bearer ${this.auth.getIdToken()}` },
    }).subscribe({
      next: ({ url }) => {
        this.http.put(url, item.file, {
          headers: { 'Content-Type': item.file.type || 'application/octet-stream' },
          reportProgress: true,
          observe: 'events',
        }).subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              item.progress = Math.round((event.loaded / event.total) * 100);
            }
            if (event.type === HttpEventType.Response) {
              item.progress = 100;
              item.status = 'done';
              item.message = 'Uploaded — refresh Workspace in a few seconds';
            }
          },
          error: () => {
            item.status = 'error';
            item.message = 'S3 upload failed';
          },
        });
      },
      error: () => {
        item.status = 'error';
        item.message = 'Could not get upload URL';
      },
    });
  }
}
