import { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

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
  const envelope: EventBridgeEnvelope = JSON.parse(body);
  const { detail, 'detail-type': detailType, time } = envelope;
  const { workspaceId, filePath } = parseS3Key(detail.object.key);
  const s3Key = detail.object.key;

  if (detailType === 'Object Created') {
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
      },
      ConditionExpression: 'attribute_not_exists(filePath)',
    })).catch((err: Error) => {
      if (err.name !== 'ConditionalCheckFailedException') throw err;
    });
    return;
  }

  if (detailType === 'Object Deleted') {
    await dynamo.send(new DeleteCommand({
      TableName: TABLE,
      Key: { workspaceId, filePath },
    }));
  }
}

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  await Promise.all(
    event.Records.map(async record => {
      try {
        await processRecord(record.body);
      } catch (err) {
        console.error(`Failed to process message ${record.messageId}:`, err);
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    })
  );

  return { batchItemFailures };
};
