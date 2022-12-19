require("dotenv").config();
import init from "./tracer";
init("fix-client");

import express from "express";
import { Request, Response } from "express";

const { Kafka } = require("kafkajs");
const opentelemetry = require("@opentelemetry/api");
import { B3Propagator } from "@opentelemetry/propagator-b3";

const kafka = new Kafka({
  clientId: "fix-client",
  brokers: ["localhost:9092"]
});

const sendKafkaMessage = async (b3Header: any) => {
  const propagator = new B3Propagator();
  const b3SingleCarrier = {
    b3: b3Header
  };

  const extractedContext = propagator.extract(opentelemetry.context.active(), b3SingleCarrier, opentelemetry.defaultTextMapGetter);
  await opentelemetry.context.with(extractedContext, async () => {
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: "fix-client-topic",
      messages: [
        {
          value: "Hello world!",
          headers: {
            b3: b3Header
          }
        }
      ]
    });

    await producer.disconnect();
    console.log("produced record on fix-client-topic");
  });
};

const app = express();
app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  await sendKafkaMessage(req.headers.b3);
  res.status(200).send({
    success: true,
    result: []
  });
});

app.listen(4000, () => {
  console.log("Application started on port 4000!");
  // consumeMessages();
});



