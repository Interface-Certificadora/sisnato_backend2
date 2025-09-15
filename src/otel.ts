import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  ExpressInstrumentation,
  ExpressLayerType,
  ExpressRequestInfo,
} from '@opentelemetry/instrumentation-express';
import {
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_URL,
} from '@opentelemetry/semantic-conventions';
import { Span } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const options = {
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
  compression: CompressionAlgorithm.GZIP,
};

const trace = new OTLPTraceExporter(options);
const exporter = new OTLPMetricExporter(options);
const http = new HttpInstrumentation();
const express = new ExpressInstrumentation({
  requestHook: function (span: Span, info: ExpressRequestInfo) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(SEMATTRS_HTTP_METHOD, info.request.method);
      span.setAttribute(SEMATTRS_HTTP_URL, info.request.baseUrl);
    }
  },
});

// Configura o SDK do OpenTelemetry
const sdk = new NodeSDK({
  traceExporter: trace,
  metricReader: new PeriodicExportingMetricReader({
    exporter: exporter,
    exportIntervalMillis: Number(process.env.OTEL_METRICS_EXPORT_INTERVAL),
    exportTimeoutMillis: Number(process.env.OTEL_METRICS_EXPORT_TIMEOUT),
  }),
  instrumentations: [getNodeAutoInstrumentations(), http, express],
});

console.log('✨ OpenTelemetry inicializado com sucesso!');

// Garante que o SDK seja finalizado corretamente ao fechar a aplicação
process.on('SIGTERM', () => {
  sdk
  .shutdown()
  .then(() => console.log('Tracing finalizado.'))
  .catch((error) => console.log('Erro ao finalizar o tracing', error))
  .finally(() => process.exit(0));
});

process.on('beforeExit', () => {
  sdk
  .shutdown()
  .then(() => console.log('Tracing finalizado.'))
  .catch((error) => console.log('Erro ao finalizar o tracing', error))
  .finally(() => process.exit(0));
});

// Inicializa o SDK
sdk.start();