import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav>
      <span *ngFor="let crumb of breadcrumbs">{{ crumb }} / </span>
    </nav>
    <ul>
      <li *ngFor="let file of files">{{ file.name }}</li>
    </ul>
  `,
})
export class WorkspaceComponent implements OnInit {
  files: { name: string }[] = [];
  breadcrumbs: string[] = ['root'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<{ files: { name: string }[] }>('/files').subscribe(res => {
      this.files = res.files;
    });
  }
}
