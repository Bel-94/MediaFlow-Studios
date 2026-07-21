export interface FileRecord {
  workspaceId: string;  // PK
  filePath: string;     // SK — e.g. "documents/report.pdf"
  fileName: string;
  s3Key: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;    // ISO-8601, used in GSI SK
  updatedAt: string;
}
