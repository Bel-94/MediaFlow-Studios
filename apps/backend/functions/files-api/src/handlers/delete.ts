import { APIGatewayProxyHandler } from 'aws-lambda';
import { FileService } from '../services/file.service';
import { ok, badRequest, serverError } from '../../../../shared/response';

const fileService = new FileService();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const key = event.pathParameters?.key;
    if (!key) return badRequest('key is required');
    await fileService.deleteFile(decodeURIComponent(key));
    return ok({ deleted: key });
  } catch (err) {
    return serverError(err);
  }
};
