import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { FileService } from './src/services/file.service';
import { MetadataService } from './src/services/metadata.service';
import { ok, badRequest, serverError } from '../../shared/response';

const fileService = new FileService();
const metadataService = new MetadataService();

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const filePath = event.pathParameters?.['filePath'];

  try {
    // POST /files/upload
    if (method === 'POST' && event.resource === '/files/upload') {
      const { fileName, contentType, workspaceId } = JSON.parse(event.body ?? '{}');
      if (!fileName || !contentType || !workspaceId) {
        return badRequest('fileName, contentType and workspaceId are required');
      }
      const result = await fileService.getUploadUrl(workspaceId, fileName, contentType);
      return ok(result);
    }

    // GET /files — list files for a workspace
    if (method === 'GET' && !filePath) {
      const workspaceId = event.queryStringParameters?.workspaceId ?? 'default';
      const files = await metadataService.listByWorkspace(workspaceId);
      return ok({ files });
    }

    // GET /files/{filePath+}
    if (method === 'GET' && filePath) {
      const workspaceId = event.queryStringParameters?.workspaceId ?? 'default';
      const file = await metadataService.get(workspaceId, decodeURIComponent(filePath));
      if (!file) return badRequest('File not found');
      return ok(file);
    }

    // DELETE /files/{filePath+}
    if (method === 'DELETE' && filePath) {
      const workspaceId = event.queryStringParameters?.workspaceId ?? 'default';
      const decoded = decodeURIComponent(filePath);
      await fileService.deleteFile(`${workspaceId}/${decoded}`);
      await metadataService.delete(workspaceId, decoded);
      return ok({ deleted: filePath });
    }

    return badRequest('Unsupported route');
  } catch (err) {
    return serverError(err);
  }
};
