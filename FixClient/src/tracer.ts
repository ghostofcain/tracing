import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

import { JaegerPropagator } from "@opentelemetry/propagator-jaeger";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "opentelemetry-instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

const { KafkaJsInstrumentation } = require("opentelemetry-instrumentation-kafkajs");
import { B3Propagator } from "@opentelemetry/propagator-b3";
import * as opentelemetry from "@opentelemetry/api";

opentelemetry.propagation.setGlobalPropagator(new B3Propagator());

const init = (serviceName: string) => {
  const traceExporter = new JaegerExporter({ endpoint: "http://localhost:14268/api/traces" });

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName
    })
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));

  provider.register({
    propagator: new JaegerPropagator()
  });

  provider.register({
    propagator: new B3Propagator()
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new ExpressInstrumentation(),
      new HttpInstrumentation(),
      new KafkaJsInstrumentation({
        producerHook: (span: any, topic: any, message: any) => {
        }
      })
    ]
  });

  const tracer = opentelemetry.trace.getTracer(serviceName);
  opentelemetry.trace.setGlobalTracerProvider(provider);
  return { tracer };
};

export default init;
