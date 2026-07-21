import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { FileRecord } from '../models/file-record.model';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

export class MetadataService {
  async put(record: FileRecord): Promise<void> {
    await client.send(new PutCommand({ TableName: TABLE, Item: record }));
  }

  async get(workspaceId: string, filePath: string): Promise<FileRecord | undefined> {
    const res = await client.send(new GetCommand({
      TableName: TABLE,
      Key: { workspaceId, filePath },
    }));
    return res.Item as FileRecord | undefined;
  }

  async listByWorkspace(workspaceId: string): Promise<FileRecord[]> {
    const res = await client.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'workspaceId = :ws',
      ExpressionAttributeValues: { ':ws': workspaceId },
    }));
    return (res.Items ?? []) as FileRecord[];
  }

  async delete(workspaceId: string, filePath: string): Promise<void> {
    await client.send(new DeleteCommand({
      TableName: TABLE,
      Key: { workspaceId, filePath },
    }));
  }
}
