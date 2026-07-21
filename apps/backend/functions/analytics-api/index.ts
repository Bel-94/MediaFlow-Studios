import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ok, serverError } from '../../shared/response';
import { logger } from '../../shared/logger';
import { count, timing } from '../../shared/metrics';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const started = Date.now();
  const correlationId = event.requestContext.requestId;

  try {
    const res = await client.send(new ScanCommand({ TableName: TABLE }));
    const items = res.Items ?? [];
    const today = new Date().toISOString().slice(0, 10);

    const summary = {
      totalFiles: items.length,
      totalSize: items.reduce((sum, i) => sum + (i['size'] ?? 0), 0),
      uploadsToday: items.filter(i => i['createdAt']?.startsWith(today)).length,
    };

    count('AnalyticsQueried');
    timing('ApiLatencyMs', Date.now() - started, { Operation: 'AnalyticsSummary' });
    logger.info('analytics.summary', { correlationId, ...summary });
    return ok(summary);
  } catch (err) {
    count('ApiErrors');
    logger.error('analytics-api.unhandled', { correlationId }, err);
    return serverError(err);
  }
};
