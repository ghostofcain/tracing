require('dotenv').config()
import init from './tracer';
init('custody-gateway');

import express from 'express';
const { Kafka } = require('kafkajs');
const axios = require('axios')

const kafka = new Kafka({
  clientId: 'custody-client',
  brokers: ['localhost:9092'],
})

const consumeMessages = async () => {
    const consumer = kafka.consumer({ groupId: 'custody-manager-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'fix-client-topic', fromBeginning: false });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`consumed message on topc=${topic}, partition=${partition}, message=${message}}`);
            await axios.get('http://localhost:6000');
        }
    });
}

const app = express();
app.use(express.json());

app.listen(4009, () => {
  consumeMessages();
});
