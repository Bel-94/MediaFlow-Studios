import { Component, Input, OnChanges } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface Version { versionId: string; lastModified: string; size: number; }

@Component({
  selector: 'app-versions',
  template: `
    <h3>Version History</h3>
    <ul>
      <li *ngFor="let v of versions">{{ v.versionId }} — {{ v.lastModified }} ({{ v.size }} bytes)</li>
    </ul>
  `,
})
export class VersionsComponent implements OnChanges {
  @Input() fileKey!: string;
  versions: Version[] = [];

  constructor(private api: ApiService) {}

  ngOnChanges(): void {
    if (this.fileKey) {
      this.api.get<{ versions: Version[] }>(`/versions/${this.fileKey}`).subscribe(res => {
        this.versions = res.versions;
      });
    }
  }
}
