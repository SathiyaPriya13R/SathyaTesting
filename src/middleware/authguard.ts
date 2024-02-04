import express = require('express');
const app = express();
import AppConstants from '../utils/constants';
import { Request, Response } from 'express';
const IORedis = require('ioredis');
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { encrypt } from '../helpers/aes';
require('dotenv').config();

const appConstant = new AppConstants();
const redisClient = new IORedis({
    host: process.env.REDIS_SERVER_IP,
    port: process.env.REDIS_SERVER_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_SERVER_DEFAULT_DB,
});

declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any>;
        }
    }
}

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
            }).catch((error: any) => { return res.status(401).send({ data: encrypt(JSON.stringify(error.message)) }) });

            if (currentData) {
                const authHeader: string | undefined = req.headers.authorization;
                const token = authHeader;
                if (!token) {
                    logger.error(appConstant.LOGGER_MESSAGE.GET_DATA_TOKEN_INVALID);
                    return res.status(401).send({ data: encrypt(JSON.stringify(appConstant.MESSAGES.INVALID_TOKEN)) });
                }

                try {
                    const secrectkey = `${process.env.JWT_SECREAT_KEK}`;
                    const decodedToken: any = jwt.verify(token, secrectkey);
                    console.log('decodedToken 0000',decodedToken);
                    // const token1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNkZTM4MDk4LWMzYmItNGM0MC04OGY4LTFkOGJlMjlkNGEyZSIsInVzZXJfdHlwZSI6Ikdyb3VwIiwiZW1haWwiOiJzYXRoZWVzaEBxd2F5LnVzIiwiZGlzcGxheU5hbWUiOiJTYXRoZWVzaCBLdW1hciIsInR5cGUiOiJVc2VyX0dyb3VwIiwiaWF0IjoxNzA2Nzc5ODMyLCJleHAiOjE3MDcwMzkwMzJ9.6NvkBCquGiBNXMGjnesDppSLKl-tY9FCuIwdVWjFN9o'
                    // const token2 = jwt.verify(token1, secrectkey)
                    // console.log("jwt.verify(token, secrectkey)",token2);
                    const allToken = currentData ? JSON.parse(currentData) : [];
                    const tokenValid = allToken.filter((item: any) => item.userid == decodedToken.id);
                    if (tokenValid && !_.isEmpty(tokenValid)) {
                        // Check expiration time
                        const currentTimestamp = Math.floor(Date.now() / 1000);
                        if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
                            return res.status(401).send({ data: encrypt(JSON.stringify(appConstant.MESSAGES.TOKEN_EXPIRED)) });
                        }

                        req.user = JSON.parse(JSON.stringify(decodedToken));
                        next();
                    } else {
                        res.status(401).send({ data: encrypt(JSON.stringify(appConstant.MESSAGES.INVALID_SESSION)) });
                    }
                } catch (verifyError) {
                    res.status(401).send({ data: encrypt(JSON.stringify(appConstant.MESSAGES.INVALID_TOKEN)) });
                }
            } else {
                res.status(401).send({ data: encrypt(JSON.stringify(appConstant.MESSAGES.NO_TOKEN_FOUND)) });
            }
        } else {
            res.status(401).send({ data: encrypt(JSON.stringify(appConstant.MESSAGES.USER_NOT_ALLOWED)) });
        }
    } catch (E: any) {
        res.status(401).send({ data: encrypt(JSON.stringify(E.message)) });
    }
});

export default app;