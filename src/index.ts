import 'dotenv/config';
import express from 'express';
import AppConstants from './utils/constants';
import bodyParser from 'body-parser';
const logger = require('./helpers/logger');
const routes = require('./routes/route');
const IORedis = require('ioredis');
const appConstant = new AppConstants();
import Corn from './helpers/cronjobs';
import { eSignService } from './services/esign';

const app = express();
const port = 3000;

const cron = new Corn();
const esign = new eSignService();

const redisClient = new IORedis({
    host: process.env.REDIS_SERVER_IP,
    port: process.env.REDIS_SERVER_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_SERVER_DEFAULT_DB,
});

// Redis client error handling
redisClient.on('error', (error: Error) => {
    console.error('Redis Error:', error);
});

// Helper function for handling Redis client events
function handleRedisEvents() {
    const events = {
        connect: appConstant.REDIS_CONNECTION.CONNECT,
        ready: appConstant.REDIS_CONNECTION.READY,
        end: appConstant.REDIS_CONNECTION.END,
        reconnecting: appConstant.REDIS_CONNECTION.RECONNECTING,
        close: appConstant.REDIS_CONNECTION.CLOSE,
    };
}

handleRedisEvents();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


app.use('/api', routes.route);

// define the cron instance
cron.generatePassword();
cron.pushDocumentNotification();
cron.pushDocumentAlert();
cron.pushPayerEnrollmentNotification();
cron.esignCreation();

app.listen(port, () => {
    return logger.info(`App is listing in port:${port}`);
});