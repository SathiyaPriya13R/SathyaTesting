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
                const query = req.query;
                if (email) {
                    // email = (email as string).toLowerCase();
                    const userData = {
                        Email: email,
                        PasswordHash: password,
                        signin: query ? query.signin : ''
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
                    res.status(400).send({ data: encrypt(JSON.stringify({ message: appConstant.MESSAGES.EMAIL_EMPTY })) });
                }
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
            if (decryptedData) {
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
            } else {
                res.status(400).send({ data: encrypt(JSON.stringify({ message: appConstant.MESSAGES.DECRYPT_ERROR })) });
            }
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
            const decryptedData = decrypt(req.body.data);
            if (decryptedData) {
                const data = JSON.parse(decryptedData)
                const userid = data.id;
                const password = data.password;
                const type = data.type;
                const finalResponse: any = await userService.updatePassword(userid, password, type, req, res);
                logger.info(appConstant.LOGGER_MESSAGE.PASSWORD_CHANGE);
                if (finalResponse == appConstant.MESSAGES.FAILED) {
                    const finalRes = {
                        data: encrypt(JSON.stringify({ message: appConstant.ERROR_MESSAGE.RESETPWD_AS_OLD }))
                    }
                    res.status(200).send(finalRes);
                } else {
                    const finalRes = {
                        data: encrypt(JSON.stringify({ message: appConstant.MESSAGES.SUCCESS }))
                    }
                    res.status(200).send(finalRes);
                }
            } else {
                res.status(400).send({ data: encrypt(JSON.stringify({ message: appConstant.MESSAGES.DECRYPT_ERROR })) });
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
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
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
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
        }
    }

    /**
     * This function is used to get the profile update
     */
    async profileUpdate(req: Request, res: Response): Promise<void> {
        try {
            const decryptedData = decrypt(req.body.data);
            const query = req.query;
            if (decryptedData) {
                const { id, type, providerGroupContactId }: { id: string, type: string, providerGroupContactId: string } = JSON.parse(JSON.stringify(req.user))
                const reqdata = JSON.parse(decryptedData);
                let imgStr;
                if (reqdata.ProfileImage) {
                    const str = reqdata.ProfileImage;
                    imgStr = atob(str);
                }
                let FirstName, LastName;
                if (!_.isNil(reqdata.FirstName) && !_.isNil(reqdata.LastName)) {
                    FirstName = reqdata.FirstName;
                    LastName = reqdata.LastName
                }
                const data = {
                    FirstName: FirstName,
                    LastName: LastName,
                    id: id,
                    type: type,
                    providergroupcontactid: providerGroupContactId,
                    imgremove: query.imgremove ? true : false
                }
                const finalRes = await userService.profileUpdate(data, imgStr);
                res.status(200).send(finalRes);
            }
            else {
                res.status(400).send({ data: encrypt(JSON.stringify({ message: appConstant.MESSAGES.DECRYPT_ERROR })) });
            }
        } catch (error: any) {
            logger.error(`${appConstant.LOGGER_MESSAGE.PROFILE_UPDATE_FAILED} ${error.message}`);
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
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
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
        }
    }

    /**
     * Password expiration check
     */

    async passwordExpirationCheck(req: Request, res: Response) {
        try {
            const { id, type } = req.params
            const pwdExpirationCheck = await userService.pwdExpirationCheck(id, type);
            res.status(200).send({ data: encrypt(JSON.stringify(pwdExpirationCheck)) });
            logger.info(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_COMPLETED);
        } catch (error: any) {
            logger.info(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_FAILED);
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
        }
    }

    /**
     * Test function
     */

    async testfunction(req: Request, res:Response) {
        try {
            const finalRes = {
                "data": {
                    "2024-Feb-4": [
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 2
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 2
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 2
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 4,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 2
                        }
                    ],
                    "2024-Feb-3": [
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 1
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 6
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 6
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 1
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 3,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 1
                        }
                    ],
                    "2024-Feb-2": [
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 40
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 58
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 4
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 6
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 13
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 2
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 2,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 9
                        }
                    ],
                    "2024-Feb-1": [
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 47
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 68
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 4
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 3
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 3
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 5
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Feb",
                            "week_number": 1,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2024-Jan-5": [
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 10
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 13
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 1
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 3
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 6
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 5,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 1
                        }
                    ],
                    "2024-Jan-4": [
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 28
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 30
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 6
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 3
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 1
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 5
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 4,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 3
                        }
                    ],
                    "2024-Jan-3": [
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 21
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 18
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 6
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 3
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 3,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 2
                        }
                    ],
                    "2024-Jan-2": [
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 6
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 9
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 1
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 4
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 5
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 2,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2024-Jan-1": [
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 7
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 2
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2024",
                            "month": "Jan",
                            "week_number": 1,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Dec-6": [
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 6,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Dec-5": [
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Dec-4": [
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 4
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 4
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 4,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Dec-3": [
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Dec-2": [
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 11
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 10
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Dec",
                            "week_number": 2,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 2
                        }
                    ],
                    "2023-Dec-1": [
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Nov-5": [
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Nov-4": [
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 5
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 6
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 3
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 4,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 1
                        }
                    ],
                    "2023-Nov-3": [
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Nov-2": [
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 5
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 4
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Nov",
                            "week_number": 2,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Nov-1": [
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Oct-5": [
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": null,
                            "month": null,
                            "week_number": null,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Oct-4": [
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 6
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 3
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 4,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Oct-3": [
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 5
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 8
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 3,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 1
                        }
                    ],
                    "2023-Oct-2": [
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 2,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Oct-1": [
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 5
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 4
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Oct",
                            "week_number": 1,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 2
                        }
                    ],
                    "2023-Sep-5": [
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 5,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Sep-4": [
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 5
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 3
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 4,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Sep-3": [
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 13
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 7
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 3,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 1
                        }
                    ],
                    "2023-Sep-2": [
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 4
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 2,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ],
                    "2023-Sep-1": [
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "APPROVED",
                            "LookupValueID": "8F2E26F7-B7BB-4394-936E-39A5F6D37F1A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "COMPLETED",
                            "LookupValueID": "24829A3A-A5B9-4E59-B08C-783FCB2F29EB",
                            "status_count": 8
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "ENROLL SUFF",
                            "LookupValueID": "CEEC7903-95BA-4DD2-9C14-B86DCA9C4CEF",
                            "status_count": 1
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "FORM FILLING",
                            "LookupValueID": "50292BC6-E8C8-455C-97FD-EA0241C37279",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "FUTURE",
                            "LookupValueID": "B758E70D-3ACC-4E55-902B-6644451E671C",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "IN-PROCESS",
                            "LookupValueID": "E9988C59-84C6-4224-9A86-B42321CFAD41",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "PEND PRACTICE",
                            "LookupValueID": "5F807011-A5B2-4461-9DE0-7A1469E4170A",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "PENDING WITH QWAY",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392CBF",
                            "status_count": 2
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "Pending For Confirmation",
                            "LookupValueID": "3B666496-46D4-4AC3-9D40-6C1F47392BCF",
                            "status_count": 0
                        },
                        {
                            "year": "2023",
                            "month": "Sep",
                            "week_number": 1,
                            "status": "REJECTED",
                            "LookupValueID": "45F2D65C-6E39-4969-B3E2-61477BF32AC8",
                            "status_count": 0
                        }
                    ]
                },
                "message": "Dashboard statistics data found"
            }
            res.status(200).send(finalRes);
        } catch (error:any) {
            logger.info(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_FAILED);
            res.status(400).send({ data: encrypt(JSON.stringify(error.message)) });
        }
    }
}