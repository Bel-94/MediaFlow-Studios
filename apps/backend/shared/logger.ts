/**
 * Structured JSON logger for CloudWatch Logs Insights.
 * Business value: ops can query by correlationId, route, and outcome without scraping free-text logs.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  service?: string;
  correlationId?: string;
  workspaceId?: string;
  route?: string;
  [key: string]: unknown;
}

const SERVICE = process.env.AWS_LAMBDA_FUNCTION_NAME ?? process.env.PROJECT_NAME ?? 'mediaflow';
const ENVIRONMENT = process.env.ENVIRONMENT ?? 'unknown';

function write(level: LogLevel, message: string, context: LogContext = {}, err?: unknown): void {
  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: context.service ?? SERVICE,
    environment: ENVIRONMENT,
    ...context,
  };

  if (err !== undefined) {
    const e = err as Error;
    entry.error = {
      name: e?.name ?? 'Error',
      message: e?.message ?? String(err),
      stack: e?.stack,
    };
  }

  const line = JSON.stringify(entry);
  if (level === 'ERROR') {
    console.error(line);
  } else if (level === 'WARN') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write('DEBUG', message, context),
  info: (message: string, context?: LogContext) => write('INFO', message, context),
  warn: (message: string, context?: LogContext) => write('WARN', message, context),
  error: (message: string, context?: LogContext, err?: unknown) => write('ERROR', message, context, err),
};
