import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import DashboardService from '../services/dashboardservices';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const dashboardService = new DashboardService();
export default class DashboardController {

    async getStatistic(req: Request, res: Response) {
        try {
            const decryptedData = decrypt(req.body.data);
            if (decryptedData) {
                const data = JSON.parse(decryptedData)
                const user_data = data;
                await dashboardService.getStatisticsCount(user_data).then((data: any) => {
                    if (data.error) {
                        res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                    } else {
                        res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                    }
                }).catch((error) => {
                    res.status(400).send({ data: encrypt(JSON.stringify(error)) });
                });

            } else {
                res.status(400).send({ data: encrypt(JSON.stringify({ message: appConstant.MESSAGES.DECRYPT_ERROR })) });
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

    /**
     * The below funcation is used to get the count of the provider, location, payer
     */
    async dashboardsummary(req: Request, res: Response) {
        try {
            const decryptedData = decrypt(req.body.data);
            const data = JSON.parse(decryptedData)
            const {userid, user_type} = data;
            const finalRes: any = await dashboardService.getDashBoardSummary(userid, user_type);
            res.status(200).send(finalRes);
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_FAILED} ${error.message}`);
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
        }
    } 
}