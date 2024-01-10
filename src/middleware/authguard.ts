import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import AppConstants from '../utls/constants';
const logger = require('../helpers/logger');

const appConstant = new AppConstants();

export default class AuthGuard {
    /**
   * Get data from auth token using jwt decode method
   */
    async getDataByToken(req: Request) {
        try {
            const authHeader: string | undefined = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            if (!token) {
                logger.error(appConstant.LOGGER_MESSAGE.GET_DATA_TOKEN_INVALID);
                return appConstant.MESSAGES.INVALID_TOKEN;
            }
            const decodedToken: any = jwt.decode(token);
            return decodedToken;
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.GET_DATA_TOKEN_FAILED} ${error.message}`);
            return appConstant.MESSAGES.INVALID_TOKEN;
        }
    }
}