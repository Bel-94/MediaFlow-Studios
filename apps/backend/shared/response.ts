import { APIGatewayProxyResult } from 'aws-lambda';

const json = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body),
});

export const ok = (body: unknown) => json(200, body);
export const badRequest = (msg: string) => json(400, { error: msg });
export const serverError = (err: unknown) => json(500, { error: (err as Error).message ?? 'Internal server error' });
