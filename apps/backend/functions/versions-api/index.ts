import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, ListObjectVersionsCommand, GetObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ok, badRequest, serverError } from '../../shared/response';
import { logger } from '../../shared/logger';
import { count, timing } from '../../shared/metrics';

const s3 = new S3Client({});
const BUCKET = process.env.BUCKET_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const started = Date.now();
  const correlationId = event.requestContext.requestId;

  try {
    const key = event.pathParameters?.['filePath'];
    if (!key) {
      count('VersionsRejected');
      return badRequest('key is required');
    }

    const decodedKey = decodeURIComponent(key);
    const res = await s3.send(new ListObjectVersionsCommand({ Bucket: BUCKET, Prefix: decodedKey }));
    const versions = await Promise.all(
      (res.Versions ?? []).map(async v => ({
        versionId: v.VersionId,
        lastModified: v.LastModified,
        size: v.Size,
        downloadUrl: await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: BUCKET, Key: decodedKey, VersionId: v.VersionId }),
          { expiresIn: 300 },
        ),
      }))
    );

    if (event.httpMethod === 'POST') {
      const { versionId } = JSON.parse(event.body ?? '{}');
      if (!versionId) {
        count('VersionRestoreRejected');
        return badRequest('versionId is required');
      }
      const copySource = `${BUCKET}/${decodedKey}?versionId=${versionId}`;
      await s3.send(new CopyObjectCommand({ Bucket: BUCKET, CopySource: copySource, Key: decodedKey }));
      count('VersionRestored');
      timing('ApiLatencyMs', Date.now() - started, { Operation: 'RestoreVersion' });
      logger.info('version.restored', { correlationId, key: decodedKey, versionId });
      return ok({ restored: versionId });
    }

    count('VersionsListed');
    timing('ApiLatencyMs', Date.now() - started, { Operation: 'ListVersions' });
    logger.info('versions.listed', { correlationId, key: decodedKey, count: versions.length });
    return ok({ versions });
  } catch (err) {
    count('ApiErrors');
    logger.error('versions-api.unhandled', { correlationId }, err);
    return serverError(err);
  }
};
