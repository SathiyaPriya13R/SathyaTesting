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
    async signinUser(req: Request, res: Response) {
        try {
            const decryptedData = decrypt(req.body.data);

            if (decryptedData) {
                const data = JSON.parse(decryptedData)
                let { email, password } = data;
                email = (email as string).toLowerCase();
                const userData = {
                    Email: email,
                    PasswordHash: password,
                }
                await userService.signinUser(userData).then((data: any) => {
                    if (data && data.error) {
                        res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                    } else {
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
                    data: encrypt(JSON.stringify({ message: appConstant.MESSAGES.LINK_GENERATED }))
                }
                res.status(200).send(finalRes);
            })
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.PASSWORD_GENERATION_FAILED} ${error.message}`);
            res.status(400).send({ data: encrypt(JSON.stringify((error.message))) });
        }
    }

    /**
     * The below function is used to change the password if the user forgets
     */
    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            // const decryptedData = decrypt(req.body.data);
            // const data = JSON.parse(decryptedData)
            const data = req.body;
            const userid = data.id;
            const password = data.password;
            const type = data.type;
            const finalResponse: any = await userService.updatePassword(userid, password, type, req, res);
            logger.info(appConstant.LOGGER_MESSAGE.PASSWORD_CHANGE);
            if (finalResponse == appConstant.MESSAGES.FAILED) {
                const finalRes = {
                    data: encrypt(JSON.stringify({ message: appConstant.ERROR_MESSAGE.RESETPWD_AS_OLD }))
                }
                res.status(400).send(finalRes);
            } else {
                const finalRes = {
                    data: encrypt(JSON.stringify({ message: appConstant.MESSAGES.SUCCESS }))
                }
                res.status(200).send(finalRes);
            }
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.PASSWORD_CHANGE_FAILED} ${error.message}`);
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
        }
    }

    /**
     * The function below is used for the get Terms of service or Privacy Policy
     */
    async TermsofservicePrivacyPolicy(req: Request, res: Response): Promise<void> {
        try {
            const query: string = JSON.parse(JSON.stringify(req.query.page_url));
            const responseData = await userService.TermsofservicePrivacyPolicy(query);
            logger.info(appConstant.LOGGER_MESSAGE.TERMS_OF_SERVICE);
            res.status(200).send({ data: encrypt(JSON.stringify(responseData)) });
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.TERMS_OF_SERVICE_FAILED} ${error.message}`);
            res.status(400).send(error.message);
        }
    }

    /**
     * This function is used to get the profile data
     */
    async profileGet(req: Request, res: Response): Promise<void> {
        try {
            const data: any = req.user;
            const finalRes = await userService.profileGet(data);
            logger.info(appConstant.LOGGER_MESSAGE.PROFILE_GET_COMPLETED)
            res.status(200).send(finalRes);
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.PROFILE_GET_FAILED} ${error.message}`);
            res.status(400).send(error.message);
        }
    }

    /**
     * This function is used to get the profile update
     */
    async profileUpdate(req: Request, res: Response): Promise<void> {
        try {
            const { id, type, providerGroupContactId }: { id: string, type: string, providerGroupContactId: string } = JSON.parse(JSON.stringify(req.user))
            const str = req.body.image;
            const imgStr = atob(str);
            const { FirstName, LastName } = req.body;
            const data = {
                FirstName: FirstName,
                LastName: LastName,
                id: id,
                type: type,
                providergroupcontactid: providerGroupContactId
            }
            const finalRes = await userService.profileUpdate(data, imgStr);
            res.status(200).send(finalRes)
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.TERMS_OF_SERVICE_FAILED} ${error.message}`);
            res.status(400).send(error.message);
        }
    }

    /**
     * This function is used to logout a user 
     */
    async logOut(req: Request, res: Response): Promise<void> {
        try {
            const data: any = req.user;
            const finalRes = await userService.logOut(data);
            logger.info(appConstant.LOGGER_MESSAGE)
            res.status(200).send(finalRes);
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.PROFILE_GET_FAILED} ${error.message}`);
            res.status(400).send(error.message);
        }
    }
}