import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const s3Client = new S3Client({});
export const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
