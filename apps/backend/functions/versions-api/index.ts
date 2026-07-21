import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, ListObjectVersionsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ok, badRequest, serverError } from '../../shared/response';

const s3 = new S3Client({});
const BUCKET = process.env.BUCKET_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const key = event.pathParameters?.['filePath'];
    if (!key) return badRequest('key is required');

    const res = await s3.send(new ListObjectVersionsCommand({ Bucket: BUCKET, Prefix: decodeURIComponent(key) }));
    const versions = await Promise.all(
      (res.Versions ?? []).map(async v => ({
        versionId: v.VersionId,
        lastModified: v.LastModified,
        size: v.Size,
        downloadUrl: await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: decodeURIComponent(key), VersionId: v.VersionId }), { expiresIn: 300 }),
      }))
    );

    // POST = restore, GET = list
    if (event.httpMethod === 'POST') {
      const { versionId } = JSON.parse(event.body ?? '{}');
      if (!versionId) return badRequest('versionId is required');
      const copySource = `${BUCKET}/${decodeURIComponent(key)}?versionId=${versionId}`;
      const { CopyObjectCommand } = await import('@aws-sdk/client-s3');
      await s3.send(new CopyObjectCommand({ Bucket: BUCKET, CopySource: copySource, Key: decodeURIComponent(key) }));
      return ok({ restored: versionId });
    }

    return ok({ versions });
  } catch (err) {
    return serverError(err);
  }
};
