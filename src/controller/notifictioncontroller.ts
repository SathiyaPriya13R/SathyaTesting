import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import NotificationService from '../services/notificationservices'
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const notificationService = new NotificationService();

export default class NotificationController {
    async getCountData(req: Request, res: Response): Promise<void> {
        try {
            logger.info(appConstant.COUNT_MESSAGE.COUNT_FUNCTION_STARTED)
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
            const userData = { entity: filter_data.type };
            const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user))
            const count = await notificationService.getCount(user_data, userData);
            res.status(200).send({ data: encrypt(JSON.stringify(count)) });
        } catch (error) {
            logger.error(error);
            res.status(400).send(JSON.parse(JSON.stringify(error)));
        }
    }
}