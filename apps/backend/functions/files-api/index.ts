import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { FileService } from './src/services/file.service';
import { MetadataService } from './src/services/metadata.service';
import { ok, badRequest, serverError } from '../../shared/response';
import { logger } from '../../shared/logger';
import { count, timing } from '../../shared/metrics';

const fileService = new FileService();
const metadataService = new MetadataService();

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  const started = Date.now();
  const method = event.httpMethod;
  const filePath = event.pathParameters?.['filePath'];
  const correlationId = event.requestContext.requestId;
  const route = `${method} ${event.resource}`;

  try {
    // POST /files/upload
    if (method === 'POST' && event.resource === '/files/upload') {
      const { fileName, contentType, workspaceId } = JSON.parse(event.body ?? '{}');
      if (!fileName || !contentType || !workspaceId) {
        count('UploadUrlRejected');
        logger.warn('upload.url.rejected', { correlationId, route, reason: 'validation' });
        return badRequest('fileName, contentType and workspaceId are required');
      }
      const result = await fileService.getUploadUrl(workspaceId, fileName, contentType);
      count('UploadUrlIssued', 1, { workspaceId });
      timing('ApiLatencyMs', Date.now() - started, { Operation: 'UploadUrl' });
      logger.info('upload.url.issued', {
        correlationId,
        route,
        workspaceId,
        fileName,
        key: result.key,
      });
      return ok(result);
    }

    // GET /files — list files for a workspace
    if (method === 'GET' && !filePath) {
      const workspaceId = event.queryStringParameters?.workspaceId ?? 'default';
      const files = await metadataService.listByWorkspace(workspaceId);
      count('FilesListed');
      timing('ApiLatencyMs', Date.now() - started, { Operation: 'ListFiles' });
      logger.info('files.listed', { correlationId, route, workspaceId, count: files.length });
      return ok({ files });
    }

    // GET /files/{filePath+}
    if (method === 'GET' && filePath) {
      const workspaceId = event.queryStringParameters?.workspaceId ?? 'default';
      const file = await metadataService.get(workspaceId, decodeURIComponent(filePath));
      if (!file) {
        count('FileNotFound');
        return badRequest('File not found');
      }
      count('FileFetched');
      timing('ApiLatencyMs', Date.now() - started, { Operation: 'GetFile' });
      return ok(file);
    }

    // DELETE /files/{filePath+}
    if (method === 'DELETE' && filePath) {
      const workspaceId = event.queryStringParameters?.workspaceId ?? 'default';
      const decoded = decodeURIComponent(filePath);
      await fileService.deleteFile(`${workspaceId}/${decoded}`);
      await metadataService.delete(workspaceId, decoded);
      count('FileDeleted', 1, { workspaceId });
      timing('ApiLatencyMs', Date.now() - started, { Operation: 'DeleteFile' });
      logger.info('file.deleted', { correlationId, route, workspaceId, filePath: decoded });
      return ok({ deleted: filePath });
    }

    return badRequest('Unsupported route');
  } catch (err) {
    count('ApiErrors');
    logger.error('files-api.unhandled', { correlationId, route }, err);
    return serverError(err);
  }
};
