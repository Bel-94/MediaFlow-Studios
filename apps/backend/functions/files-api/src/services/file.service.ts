import { S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({});
const BUCKET = process.env.BUCKET_NAME!;

export function buildFileKey(workspaceId: string, fileName: string, now = Date.now()): string {
  return `${workspaceId}/${now}-${fileName}`;
}

export class FileService {
  async listFiles(prefix: string) {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }));
    return (res.Contents ?? []).map(obj => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    }));
  }

  async getUploadUrl(workspaceId: string, fileName: string, contentType: string) {
    const key = buildFileKey(workspaceId, fileName);
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 300 }
    );
    return { url, key, workspaceId, filePath: key.slice(workspaceId.length + 1) };
  }

  async deleteFile(key: string) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  }
}
