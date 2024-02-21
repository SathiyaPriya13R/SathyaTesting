import { Request, Response } from 'express';
import Validation from "../validations/validators"
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import PayerService from '../services/payerservice';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const payerService = new PayerService();

export default class PayerController {

    /**
     * List all and get by provder id - payers data
     */
    async getPayer(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
            const { limit, offset }: { limit: number, offset: number } = JSON.parse(JSON.stringify(req.query));
            filter_data.limit = (limit) ? limit : null;
            filter_data.offset = (offset) ? offset : null
            filter_data.all = (!_.isNil(req.query.all) && req.query.all == 'false') ? false : true
            const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user))
            await payerService.getPayerData(user_data, filter_data).then((data: any) => {
                if (data.error) {
                    res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error) => {
                res.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_FAILED, error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

    /**
     * Get all history of the payer by payer id
     */
    async getPayerHistory(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
            await payerService.getPayerHistoryData(filter_data).then((data: any) => {
                if (data.error) {
                    res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error) => {
                res.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.PAYER_MESSAGES.PAYER_HISTORY_FUNCTION_FAILED, error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

}