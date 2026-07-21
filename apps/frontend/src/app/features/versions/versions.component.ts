import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { FileSizePipe } from '../../shared/file-size.pipe';

interface Version {
  versionId: string;
  lastModified: string;
  size: number;
  downloadUrl?: string;
}

@Component({
  selector: 'app-versions',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FileSizePipe,
  ],
  template: `
    <section class="versions">
      <header>
        <h2>Version history</h2>
        <p>{{ fileName }}</p>
      </header>

      @if (loading) {
        <div class="state"><mat-spinner diameter="28"></mat-spinner></div>
      } @else if (error) {
        <div class="state error">{{ error }}</div>
      } @else if (!versions.length) {
        <div class="state">No versions found for this object yet.</div>
      } @else {
        <mat-nav-list>
          @for (v of versions; track v.versionId) {
            <a mat-list-item [href]="v.downloadUrl" target="_blank" rel="noopener">
              <span matListItemTitle>{{ v.versionId }}</span>
              <span matListItemLine>
                {{ v.lastModified | date:'medium' }} · {{ v.size | fileSize }}
              </span>
            </a>
            <div class="row-actions">
              <button mat-stroked-button type="button" (click)="restore(v.versionId)">Restore</button>
            </div>
          }
        </mat-nav-list>
      }
    </section>
  `,
  styles: [`
    .versions {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(15, 39, 68, 0.08);
      border-radius: 0.75rem;
    }

    h2 {
      font-family: "Source Serif 4", Georgia, serif;
      font-size: 1.35rem;
      color: #0f2744;
      margin-bottom: 0.2rem;
    }

    header p { color: #64748b; margin-bottom: 0.75rem; word-break: break-all; }

    .state {
      padding: 1rem 0;
      color: #64748b;
      display: grid;
      place-items: center;
    }

    .state.error { color: #b91c1c; }

    .row-actions {
      padding: 0 1rem 0.75rem 1rem;
    }
  `],
})
export class VersionsComponent implements OnChanges {
  @Input({ required: true }) fileKey!: string;
  @Input() fileName = '';

  versions: Version[] = [];
  loading = false;
  error: string | null = null;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileKey'] && this.fileKey) {
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const key = encodeURIComponent(this.fileKey);
    this.api.get<{ versions: Version[] }>(`/versions/${key}`).subscribe({
      next: (res) => {
        this.versions = res.versions ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load versions.';
      },
    });
  }

  restore(versionId: string): void {
    const key = encodeURIComponent(this.fileKey);
    this.api.post<{ restored: string }>(`/versions/${key}`, { versionId }).subscribe({
      next: () => {
        this.snack.open('Version restored as current object', 'OK', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Restore failed', 'Dismiss', { duration: 3000 }),
    });
  }
}
