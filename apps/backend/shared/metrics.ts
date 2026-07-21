/**
 * CloudWatch Embedded Metric Format (EMF) helpers.
 * Emits custom business metrics via structured logs — no PutMetricData API calls required.
 *
 * Metric dimensions are intentionally limited to Environment + Service so dashboards/alarms
 * stay stable. Extra context (workspaceId, etc.) is included in the log payload for Insights.
 */

const ENVIRONMENT = process.env.ENVIRONMENT ?? 'unknown';
const SERVICE = process.env.AWS_LAMBDA_FUNCTION_NAME ?? 'unknown';

export type MetricUnit = 'Count' | 'Milliseconds' | 'Bytes' | 'None';

export interface MetricDatum {
  name: string;
  value: number;
  unit?: MetricUnit;
}

/**
 * Publish one or more metrics in a single EMF log line.
 * @param context Non-dimension fields for Logs Insights (workspaceId, operation, …)
 */
export function emitMetrics(
  metrics: MetricDatum[],
  context: Record<string, string | number | boolean> = {},
): void {
  const dimensionKeys = ['Environment', 'Service'];

  const metricDefs = metrics.map(m => ({
    Name: m.name,
    Unit: m.unit ?? 'Count',
  }));

  const values: Record<string, number | string | boolean> = {
    Environment: ENVIRONMENT,
    Service: SERVICE,
    ...context,
  };
  for (const m of metrics) {
    values[m.name] = m.value;
  }

  const payload = {
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [
        {
          Namespace: 'MediaFlow/DAM',
          Dimensions: [dimensionKeys],
          Metrics: metricDefs,
        },
      ],
    },
    ...values,
  };

  console.log(JSON.stringify(payload));
}

export function count(
  name: string,
  value = 1,
  context?: Record<string, string | number | boolean>,
): void {
  emitMetrics([{ name, value, unit: 'Count' }], context);
}

export function timing(
  name: string,
  milliseconds: number,
  context?: Record<string, string | number | boolean>,
): void {
  emitMetrics([{ name, value: milliseconds, unit: 'Milliseconds' }], context);
}
