'use strict';

require('dotenv').config();
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const { context, trace } = require('@opentelemetry/api'); // 👈 para obtener traceId/spanId
const winston = require('winston'); // 👈 logger recomendado

// ---------- Recursos OTEL ----------
const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'cap_hr_bajasmexico',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION || '1.0.0',
    'deployment.environment': process.env.NODE_ENV || 'unknown'
  })
);

// ---------- Función utilitaria para obtener traceId/spanId ----------
function getTraceContext() {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    return {
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    };
  }
  return {};
}

// ---------- Logger global con Winston ----------
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      const ctx = getTraceContext();
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...ctx,
      });
    })
  ),
  transports: [new winston.transports.Console()],
});

// ---------- OpenTelemetry SDK ----------
function parseHeaders(headerStr = '') {
  if (!headerStr || headerStr.trim() === '') {
    return {};
  }
  const headers = {};
  const pairs = headerStr.split(',');
  for (const pair of pairs) {
    const parts = pair.split('=');
    if (parts.length === 2) {
      headers[parts[0].trim()] = parts[1].trim();
    } else if (parts.length > 2) {
      headers[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
  return headers;
}

const sdk = new NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter({
    url: `${process.env.OTEL_COLLECTOR_ENDPOINT}/v1/traces`,
    headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${process.env.OTEL_COLLECTOR_ENDPOINT}/v1/metrics`,
      headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
    }),
    exportIntervalMillis: 15000
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

// ---------- Start ----------
try {
  sdk.start();
  logger.info('✅ OpenTelemetry iniciado');
} catch (err) {
  logger.error(`❌ Error iniciando OpenTelemetry: ${err.message}`);
}

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => logger.info('OpenTelemetry SDK apagado exitosamente'))
    .catch((error) => logger.error(`Error apagando OpenTelemetry SDK: ${error.message}`))
    .finally(() => process.exit(0));
});

// ---------- Exportar logger para usar en la app ----------
module.exports = logger;

