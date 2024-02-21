import { Request, Response } from 'express';
import Validation from "../validations/validators"
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import LocationService from '../services/locationservice';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const locationService = new LocationService();

export default class LocationController {

    /**
     * List all and get by provder id - location data
     */
    async getLocation(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const { limit, offset }: { limit: number, offset: number } = JSON.parse(JSON.stringify(req.query));
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
            filter_data.all = (!_.isNil(req.query.all) && req.query.all == 'false') ? false : true
            filter_data.limit = (limit) ? limit : null;
            filter_data.offset = (offset) ? offset : null
            const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user))
            await locationService.getLocationData(user_data, filter_data).then((data: any) => {
                if (data.error) {
                    res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error) => {
                res.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_FAILED, error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

}