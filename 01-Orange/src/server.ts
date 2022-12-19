require('dotenv').config()
import init from './tracer';
init('orange');

import express from 'express';
import { Request, Response } from 'express';
const axios = require('axios')

const app = express();
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  const response = await axios.get('http://localhost:1002/')
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  res.status(200).send({
    success: true,
    result: { 'result': 'ok!' }
  })
});

app.listen(1000, async () => {
  console.log('Application started on port 1000!');
});
