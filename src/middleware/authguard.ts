import express = require('express');
const app = express();
import AppConstants from '../utils/constants';
import { Request, Response } from 'express';
const IORedis = require('ioredis');
import jwt from 'jsonwebtoken';
import _ from 'lodash';

const appConstant = new AppConstants();
const redisClient = new IORedis({
    host: process.env.REDIS_SERVER_IP,
    port: process.env.REDIS_SERVER_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_SERVER_DEFAULT_DB,
});
app.use(async function (req: Request, res: Response, next) {
    const token = req.headers.authorization as string;
    try {
        if (token) {
            const currentData: any = await new Promise((resolve, reject) => {
                redisClient.get(appConstant.REDIS_AUTH_TOKEN_KEYNAME, (getError: any, data: string) => {
                    if (getError) {
                        logger.error(appConstant.ERROR_MESSAGE.ERROR_FETCHING_TOKEN_DETAILS, getError);
                        reject(new Error(appConstant.ERROR_MESSAGE.MIST_TOKEN_FAILED));
                    } else {
                        resolve(data);
                    }
                });
            }).catch((error: any) => { throw new Error(error) });
            if (currentData) {
                const authHeader: string | undefined = req.headers.authorization;
                const token = authHeader;
                if (!token) {
                    logger.error(appConstant.LOGGER_MESSAGE.GET_DATA_TOKEN_INVALID);
                    return appConstant.MESSAGES.INVALID_TOKEN;
                }
                const decodedToken: any = jwt.decode(token);
                const allToken = currentData ? JSON.parse(currentData) : [];
                const tokenValid = allToken.filter((item: any) => item.userid == decodedToken.id);
                if (tokenValid && !_.isEmpty(tokenValid)) {
                    next();
                } else {
                    res.status(400).send(appConstant.MESSAGES.INVALID_SESSION)
                }
            } else {
                res.status(400).send(appConstant.MESSAGES.NO_TOKEN_FOUND)
            }
        } else {
            res.status(400).send(appConstant.MESSAGES.USER_NOT_ALLOWED)
        }
    } catch (E: any) {
        res.status(400).send(E.message)
    }
})

export default app;