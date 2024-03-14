import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _, { filter } from 'lodash';
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
            const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user))
            const count = await notificationService.getCount(user_data, filter_data);
            res.status(200).send({ data: encrypt(JSON.stringify(count)) });
        } catch (error) {
            logger.error(error);
            res.status(400).send(JSON.parse(JSON.stringify(error)));
        }
    }

    async getNotificationList(request: Request, response: Response) {
        try {
            const decryptedData = (request.body.data) ? decrypt(request.body.data) : null;
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
            const { limit, offset }: { limit: number, offset: number } = JSON.parse(JSON.stringify(request.query));
            filter_data.limit = (limit) ? limit : null;
            filter_data.offset = (offset) ? offset : null;
            const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(request.user))
            await notificationService.getNotificationList(user_data, filter_data).then((data: any) => {
                if (data.error) {
                    response.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    response.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error) => {
                response.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_LIST_FUNCTION_FAILED, error);
            response.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

    async getNotificationByid(request: Request, response: Response) {
        try {
            const notification_id: any = (request.params.id) ? request.params.id : null
            await notificationService.getNotificationByid(notification_id).then((data: any) => {
                if (data.error) {
                    response.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    response.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error) => {
                response.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_BYID_FUNCTION_FAILED, error);
            response.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

    async updateNotificationStatus(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const update_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
            await notificationService.updateNotificationStatus(update_data).then((data: any) => {
                if (data.error) {
                    res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error) => {
                res.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_STATUS_UPDATE_FAILED, error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }
}