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
            logger.error(error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }
    async providerSpec(req: Request, res: Response) {
        try {
            const data = req.params;
            let { id } = data;
            const body = req.body;
            await providerService.providerSpec(id, body).then((data) => {
                logger.info(appConstant.LOGGER_MESSAGE.PROVIDER_SPEC_FUNCTION_COMPLETED);
                res.status(200).send(data);
            }) 
        } catch (error) {
            logger.error(appConstant.LOGGER_MESSAGE.PROVIDER_SPEC_FUNCTION_FAILED);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }    
}