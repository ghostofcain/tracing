require('dotenv').config()
import init from './tracer';
const { tracer } = init('omniex');

import express from 'express';
import { Request, Response } from 'express';
const axios = require('axios')
const opentelemetry = require('@opentelemetry/api');

const app = express();
app.use(express.json());

app.get('/order/:id', async (req: Request, res: Response) => {

  const activeSpan = opentelemetry.trace.getActiveSpan();
  activeSpan.setAttribute('orderId', req.params.id);

  const context = opentelemetry.context.active();
  const span = tracer.startSpan('calling FIX', {}, context);
  span.setAttribute('some-attribute', 'attribute1');
  span.addEvent('starting operation');
  const fixResponse = await axios.get('http://localhost:4000')
  span.addEvent('finishing operation');
  span.end();

  const context2 = opentelemetry.context.active();
  const span2 = tracer.startSpan('calling Numerix', {}, context2);
  span2.setAttribute('some-attribute', 'attribute1');
  span2.addEvent('starting operation');
  const numerixResponse = await axios.get('http://localhost:3001')
  span2.addEvent('finishing operation');
  span2.end();

  res.status(200).send({
    success: true,
    result: {
      numerix: numerixResponse.data,
      fix: fixResponse.data
    }
  });
});

app.listen(3000, () => {
  console.log('Application started on port 3000!');
});
