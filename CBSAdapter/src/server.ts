require('dotenv').config()
import init from './tracer';

init('cbs-adapter');

import express from 'express';
import {Request, Response} from 'express';

import {createClient} from 'redis';

const app = express();
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    const redisClient = createClient();
    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    redisClient.get('key', (error, value) => console.log('value already in redis', value));
    redisClient.set('key', JSON.stringify([{data: 'some-data'}]));
    redisClient.get('key', (error, value) => console.log('value after insertion in redis', value));

    res.status(200).send({
        success: true,
        result: [],
    })
});

app.listen(6000, async () => {
    console.log('Application started on port 6000!');
});
