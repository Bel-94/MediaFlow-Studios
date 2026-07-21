import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

interface AnalyticsSummary { totalFiles: number; totalSize: number; uploadsToday: number; }

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="summary">
      <p>Total Files: {{ summary.totalFiles }}</p>
      <p>Total Size: {{ summary.totalSize | number }} bytes</p>
      <p>Uploads Today: {{ summary.uploadsToday }}</p>
    </div>
  `,
})
export class AnalyticsComponent implements OnInit {
  summary: AnalyticsSummary | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<AnalyticsSummary>('/analytics/summary').subscribe(res => {
      this.summary = res;
    });
  }
}
