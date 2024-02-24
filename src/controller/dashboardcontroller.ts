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
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            if (decryptedData) {
                const filter_data = JSON.parse(decryptedData)
                const data = filter_data
                data.initial = (!_.isNil(req.query.initial) && req.query.initial == 'true') ? true : false
                const { id, user_type }: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user));
                const user_data = { id, user_type };
                await dashboardService.getStatisticsCount(user_data, data).then((data: any) => {
                    if (data.error) {
                        res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                    } else {
                        // res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                        res.status(200).send(data);
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
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null
            const { id, user_type }: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user));
            const user_data = { id, user_type };
            const filter_data = (decryptedData) ? JSON.parse(decryptedData) : null
            const finalRes: any = await dashboardService.getDashBoardSummary(user_data, filter_data);
            res.status(200).send(finalRes);
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_FAILED} ${error.message}`);
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
        }
    }

    /**
     * The below funcation is used to get the data of providers, locations and payers.
     */
    async appFilter(req: Request, res: Response) {
        try {
            const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user));
            const filter_data = await dashboardService.getAppFilterData(user_data);
            res.status(200).send({ data: encrypt(JSON.stringify(filter_data)) });
        } catch (error) {
            logger.error(error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

    /**
     * This function used to retrive the applied filters data
     */
    async appliedFilter(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null
            const filter_data = (decryptedData) ? JSON.parse(decryptedData) : null
            const filtered_data = await dashboardService.getAppliedFilterData(filter_data);
            res.status(200).send({ data: encrypt(JSON.stringify(filtered_data)) });
        } catch (error) {
            logger.error(error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

}