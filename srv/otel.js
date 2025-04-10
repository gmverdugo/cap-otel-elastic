'use strict';

require('dotenv').config();
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'cap-otel-app',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    'deployment.environment': 'production'
  })
);

const sdk = new NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter({
    url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
  }),
  metricReader: new (require('@opentelemetry/sdk-metrics').PeriodicExportingMetricReader)({
    exporter: new OTLPMetricExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
      headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
    }),
    exportIntervalMillis: 1000
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

function parseHeaders(headerStr = '') {
  return Object.fromEntries(headerStr.split(',').map(h => h.trim().split('=')));
}

try {
  sdk.start();
  console.log('✅ OpenTelemetry iniciado');
} catch (err) {
  console.error('❌ Error iniciando OpenTelemetry', err);
}
