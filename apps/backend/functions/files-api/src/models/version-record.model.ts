export interface VersionRecord {
  workspaceId: string;  // PK — matches parent FileRecord
  filePath: string;     // SK prefix — e.g. "documents/report.pdf#v1"
  s3VersionId: string;
  size: number;
  createdAt: string;
  createdBy: string;
}
