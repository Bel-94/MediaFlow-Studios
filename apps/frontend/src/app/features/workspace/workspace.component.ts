import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { FileSizePipe } from '../../shared/file-size.pipe';
import { VersionsComponent } from '../versions/versions.component';

export interface FileRecord {
  workspaceId: string;
  filePath: string;
  fileName: string;
  s3Key: string;
  contentType: string;
  size: number;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FileSizePipe,
    VersionsComponent,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Digital asset library</p>
          <h1>Workspace</h1>
          <p class="sub">Browse assets in the default workspace. Select a file to inspect version history.</p>
        </div>
        <button mat-stroked-button type="button" (click)="load()" [disabled]="loading">
          Refresh
        </button>
      </header>

      @if (loading) {
        <div class="state"><mat-spinner diameter="36"></mat-spinner></div>
      } @else if (error) {
        <div class="state error">{{ error }}</div>
      } @else if (!files.length) {
        <div class="state empty">
          No assets yet. Upload a file to populate this workspace.
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="files" class="asset-table">
            <ng-container matColumnDef="fileName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let file">{{ file.fileName }}</td>
            </ng-container>

            <ng-container matColumnDef="contentType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let file">{{ file.contentType || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="size">
              <th mat-header-cell *matHeaderCellDef>Size</th>
              <td mat-cell *matCellDef="let file">{{ file.size | fileSize }}</td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Uploaded</th>
              <td mat-cell *matCellDef="let file">{{ file.createdAt | date:'medium' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let file">
                <button mat-button type="button" (click)="select(file); $event.stopPropagation()">
                  Versions
                </button>
                <button mat-button color="warn" type="button" (click)="remove(file); $event.stopPropagation()">
                  Delete
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: columns"
              (click)="select(row)"
              [class.selected]="selected?.s3Key === row.s3Key"
            ></tr>
          </table>
        </div>
      }

      @if (selected) {
        <app-versions [fileKey]="selected.s3Key" [fileName]="selected.fileName" />
      }
    </section>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

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

    .table-wrap {
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(15, 39, 68, 0.08);
      border-radius: 0.75rem;
      overflow: auto;
    }

    .asset-table { width: 100%; }

    .mat-mdc-row {
      cursor: pointer;
    }

    .mat-mdc-row.selected,
    .mat-mdc-row:hover {
      background: rgba(14, 116, 144, 0.06);
    }

    .state {
      padding: 2.5rem 1rem;
      text-align: center;
      color: #64748b;
      background: rgba(255, 255, 255, 0.65);
      border-radius: 0.75rem;
      border: 1px dashed rgba(15, 39, 68, 0.15);
    }

    .state.error { color: #b91c1c; border-color: rgba(185, 28, 28, 0.25); }
  `],
})
export class WorkspaceComponent implements OnInit {
  files: FileRecord[] = [];
  selected: FileRecord | null = null;
  loading = false;
  error: string | null = null;
  columns = ['fileName', 'contentType', 'size', 'createdAt', 'actions'];
  private readonly workspaceId = 'default';

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.get<{ files: FileRecord[] }>(`/files?workspaceId=${this.workspaceId}`).subscribe({
      next: (res) => {
        this.files = res.files ?? [];
        this.loading = false;
        if (this.selected) {
          this.selected = this.files.find(f => f.s3Key === this.selected?.s3Key) ?? null;
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load workspace files. Check your session and try again.';
      },
    });
  }

  select(file: FileRecord): void {
    this.selected = file;
  }

  remove(file: FileRecord): void {
    const path = encodeURIComponent(file.filePath);
    this.api.delete<{ deleted: string }>(`/files/${path}?workspaceId=${this.workspaceId}`).subscribe({
      next: () => {
        this.snack.open(`Deleted ${file.fileName}`, 'OK', { duration: 2500 });
        if (this.selected?.s3Key === file.s3Key) this.selected = null;
        this.load();
      },
      error: () => this.snack.open('Delete failed', 'Dismiss', { duration: 3000 }),
    });
  }
}
