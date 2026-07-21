import { APIGatewayProxyHandler } from 'aws-lambda';
import { FileService } from '../services/file.service';
import { ok, serverError } from '../../../../shared/response';

const fileService = new FileService();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const prefix = event.queryStringParameters?.prefix ?? '';
    const files = await fileService.listFiles(prefix);
    return ok({ files });
  } catch (err) {
    return serverError(err);
  }
};
