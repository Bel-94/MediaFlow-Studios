import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ok, serverError } from '../../shared/response';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const res = await client.send(new ScanCommand({ TableName: TABLE }));
    const items = res.Items ?? [];
    const today = new Date().toISOString().slice(0, 10);

    return ok({
      totalFiles: items.length,
      totalSize: items.reduce((sum, i) => sum + (i['size'] ?? 0), 0),
      uploadsToday: items.filter(i => i['createdAt']?.startsWith(today)).length,
    });
  } catch (err) {
    return serverError(err);
  }
};
