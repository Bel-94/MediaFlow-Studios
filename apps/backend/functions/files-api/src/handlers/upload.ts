import { APIGatewayProxyHandler } from 'aws-lambda';
import { FileService } from '../services/file.service';
import { ok, badRequest, serverError } from '../../../../shared/response';

const fileService = new FileService();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { fileName, contentType } = JSON.parse(event.body ?? '{}');
    if (!fileName || !contentType) return badRequest('fileName and contentType are required');
    const result = await fileService.getUploadUrl('default', fileName, contentType);
    return ok(result);
  } catch (err) {
    return serverError(err);
  }
};
