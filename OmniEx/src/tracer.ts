import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { JaegerPropagator } from "@opentelemetry/propagator-jaeger";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "opentelemetry-instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import * as opentelemetry from "@opentelemetry/api";
import { B3Propagator } from "@opentelemetry/propagator-b3";

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

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new ExpressInstrumentation(),
      new HttpInstrumentation()
    ]
  });

  const tracer = opentelemetry.trace.getTracer(serviceName);
  return { tracer };
};

export default init;
