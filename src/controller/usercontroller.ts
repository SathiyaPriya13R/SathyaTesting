import { Request, Response } from 'express';
import Validation from "../validations/validators"
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import UserService from '../services/userservices';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const userService = new UserService();
export default class UserController {
    /**
     * The Below function is used to login a user
     */
    async loginUser(req: Request, res: Response) {
        try {
            const decryptedData = decrypt(req.body.data);
            const data = JSON.parse(decryptedData)
            let { email, password } = data;
            email = (email as string).toLowerCase();
            const userData = {
                Email: email,
                PasswordHash: password,
            }
            await userService.loginUser(userData).then((data: any)=> {
                if (data.error) {
                    res.status(400).json(data.error)
                } else {
                    res.status(200).json(data);
                }
            }). catch((error)=>{
                res.status(400).json(error);
            })
        } catch (error) {
            logger.error(error);
        }
    }
    /**
     * The below function is used for forget password functionality
     */
    async forgetPassword(req: Request, res: Response): Promise<void> {
        try {
            const decryptedData = decrypt(req.body.data);
            const data = JSON.parse(decryptedData)
            let { email } = data;
            const email_address = (email as string).toLowerCase();
            await userService.forgetPassword(email_address).then((data) => {
                logger.info(appConstant.LOGGER_MESSAGE.PASSWORD_GENERATION);
                const finalRes = {
                    message: appConstant.MESSAGES.LINK_GENERATED
                }
                res.status(200).json(finalRes);
            })
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.PASSWORD_GENERATION_FAILED} ${error.message}`);
            res.status(400).send(error.message);
        }
    }
}