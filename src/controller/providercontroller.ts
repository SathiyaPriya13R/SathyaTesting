import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import ProviderService from '../services/providerservice';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const providerService = new ProviderService();

export default class ProviderController {

    /**
     * List all provider data
     */
    async getProvider(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : null
            const { limit, offset }: { limit: number, offset: number } = JSON.parse(JSON.stringify(req.query));
            filter_data.limit = (limit) ? limit : null;
            filter_data.offset = (offset) ? offset : null
            const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user))
            await providerService.getProviderData(user_data, filter_data).then((data: any) => {
                if (data.error) {
                    res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error) => {
                res.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.PROVIDER_MESSAGES.PROVIDER_FUNCTION_FAILED, error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

    /**
     * For provider specility
     */
    async providerSpec(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : null
            const body = filter_data;
            await providerService.providerSpec(body).then((data) => {
                logger.info(appConstant.LOGGER_MESSAGE.PROVIDER_SPEC_FUNCTION_COMPLETED);
                res.status(200).send(data);
            })
        } catch (error) {
            logger.error(appConstant.LOGGER_MESSAGE.PROVIDER_SPEC_FUNCTION_FAILED);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

    /**
     * For provider view plan
     */
    async getViewPlans(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
            await providerService.viewPlans(filter_data).then((data: any) => {
                if (data.error) {
                    res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error) => {
                res.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.PROVIDER_MESSAGES.PROVIDER_VIEWPLAN_FUNCTION_FAILED, error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

}