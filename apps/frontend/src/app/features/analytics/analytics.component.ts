import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { FileSizePipe } from '../../shared/file-size.pipe';

interface AnalyticsSummary {
  totalFiles: number;
  totalSize: number;
  uploadsToday: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    FileSizePipe,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Usage</p>
          <h1>Analytics</h1>
          <p class="sub">Snapshot of library size and today’s ingest activity.</p>
        </div>
        <button mat-stroked-button type="button" (click)="load()" [disabled]="loading">
          Refresh
        </button>
      </header>

      @if (loading) {
        <div class="state"><mat-spinner diameter="36"></mat-spinner></div>
      } @else if (error) {
        <div class="state error">{{ error }}</div>
      } @else if (summary) {
        <div class="grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Total files</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="metric">{{ summary.totalFiles | number }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Total size</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="metric">{{ summary.totalSize | fileSize }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Uploads today</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="metric">{{ summary.uploadsToday | number }}</p>
            </mat-card-content>
          </mat-card>
        </div>
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

    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    mat-card {
      background: rgba(255, 255, 255, 0.82);
    }

    .metric {
      font-size: 2rem;
      font-weight: 600;
      color: #0f2744;
      margin-top: 0.75rem;
    }

    .state {
      padding: 2.5rem 1rem;
      text-align: center;
      color: #64748b;
    }

    .state.error { color: #b91c1c; }

    @media (max-width: 800px) {
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class AnalyticsComponent implements OnInit {
  summary: AnalyticsSummary | null = null;
  loading = false;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.get<AnalyticsSummary>('/analytics/summary').subscribe({
      next: (res) => {
        this.summary = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load analytics summary.';
      },
    });
  }
}
