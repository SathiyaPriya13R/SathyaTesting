import { Request, Response } from 'express';
import Validation from "../validations/validators"
import AppConstants from '../utls/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');


export default class UserController {
    /**
     * The Below function is used to login a user
     */
    async loginUser(req: Request, res: Response) {
        try {
            
        } catch (error) {
            logger.error(error);
        }
    }
}