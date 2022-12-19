require("dotenv").config();

import init from "./tracer";

const { tracer } = init("numerix");

import express from "express";
import { Request, Response } from "express";
import * as opentelemetry from "@opentelemetry/api";

const app = express();
app.use(express.json());

const getDate = () => {
  const currentdate = new Date();
  return currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();
};

app.get("/", async (req: Request, res: Response) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  await delay(1000);

  const context = opentelemetry.context.active();
  const span = tracer.startSpan("some-long-operation", {}, context);
  span.setAttribute("some-attribute", "attribute1");

  span.addEvent("starting operation at " + getDate());
  await delay(1000);
  span.addEvent("finishing operation at" + getDate());
  span.end();

  res.status(200).send({
    success: true,
    result: []
  });
});

app.listen(3001, () => {
  console.log("Application started on port 3001!");
});
