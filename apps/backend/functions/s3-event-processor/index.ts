import { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { logger } from '../../shared/logger';
import { count, timing, emitMetrics } from '../../shared/metrics';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

interface EventBridgeS3Detail {
  bucket: { name: string };
  object: { key: string; size?: number; etag?: string };
  reason?: string;
}

interface EventBridgeEnvelope {
  'detail-type': string;
  time: string;
  detail: EventBridgeS3Detail;
}

function parseS3Key(rawKey: string): { workspaceId: string; filePath: string } {
  const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
  const slash = key.indexOf('/');
  if (slash === -1) return { workspaceId: 'default', filePath: key };
  return { workspaceId: key.slice(0, slash), filePath: key.slice(slash + 1) };
}

async function processRecord(body: string): Promise<void> {
  const started = Date.now();
  const envelope: EventBridgeEnvelope = JSON.parse(body);
  const { detail, 'detail-type': detailType, time } = envelope;
  const { workspaceId, filePath } = parseS3Key(detail.object.key);
  const s3Key = detail.object.key;

  if (detailType === 'Object Created') {
    let idempotentSkip = false;
    await dynamo.send(new PutCommand({
      TableName: TABLE,
      Item: {
        workspaceId,
        filePath,
        fileName: filePath.split('/').pop() ?? filePath,
        s3Key,
        size: detail.object.size ?? 0,
        contentType: '',
        uploadedBy: 'system',
        createdAt: time,
        updatedAt: time,
        status: 'ready',
      },
      ConditionExpression: 'attribute_not_exists(filePath)',
    })).catch((err: Error) => {
      if (err.name !== 'ConditionalCheckFailedException') throw err;
      idempotentSkip = true;
      count('ProcessingIdempotentSkip', 1, { workspaceId });
      logger.info('processing.idempotent_skip', { workspaceId, s3Key });
    });

    if (!idempotentSkip) {
      count('UploadProcessed', 1, { workspaceId });
      emitMetrics(
        [{ name: 'BytesIngested', value: detail.object.size ?? 0, unit: 'Bytes' }],
        { workspaceId },
      );
      timing('ProcessingLatencyMs', Date.now() - started, { EventType: 'ObjectCreated' });
      logger.info('processing.object_created', {
        workspaceId,
        filePath,
        s3Key,
        size: detail.object.size ?? 0,
      });
    }
    return;
  }

  if (detailType === 'Object Deleted') {
    await dynamo.send(new DeleteCommand({
      TableName: TABLE,
      Key: { workspaceId, filePath },
    }));
    count('MetadataDeleted', 1, { workspaceId });
    timing('ProcessingLatencyMs', Date.now() - started, { EventType: 'ObjectDeleted' });
    logger.info('processing.object_deleted', { workspaceId, filePath, s3Key });
  }
}

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  await Promise.all(
    event.Records.map(async record => {
      try {
        await processRecord(record.body);
      } catch (err) {
        count('ProcessingFailures');
        logger.error('processing.failed', { messageId: record.messageId }, err);
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    })
  );

  count('ProcessingBatchSize', event.Records.length);
  return { batchItemFailures };
};
