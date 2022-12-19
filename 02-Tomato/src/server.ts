require('dotenv').config()
import init from './tracer';
init('tomato');

import express from 'express';
import { Request, Response } from 'express';
const axios = require('axios')

const app = express();
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  const response = await axios.get('http://localhost:6000')
  res.status(200).send({
    success: true,
    result: response.data,
  })
});

app.listen(1002, async () => {
  console.log('Application started on port 1002!');
});
