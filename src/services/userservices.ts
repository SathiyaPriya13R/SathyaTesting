import { Request, Response } from 'express';
import { sequelizeObj } from '../helpers/sequelizeobj';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
import * as db from '../adapters/db';
import AuthGuard from '../middleware/authguard';
import { encrypt } from '../helpers/aes';
import path from 'path';
const logger = require('../helpers/logger');
const fs = require('fs');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const _ = require("lodash");

const appConstant = new AppConstants();
const authGuard = new AuthGuard();

export default class UserService {
    /**
     * User Payer - Method
     */
    async loginUser(userData: Record<string, any>): Promise<any> {
        try {
            logger.info(appConstant.LOGGER_MESSAGE.LOGIN_STARTED);
            const commonService = new CommonService(db.user);
            const emailValidation: sequelizeObj = {};
            emailValidation.where = {
                Email: userData.Email
            };
            const email = await commonService.getData(emailValidation, db.User);
            // const providerEmail = await commonService.getData(emailValidation, db.)
            if (!_.isNil(email)) {
                const parameters: sequelizeObj = {};
                parameters.where = userData;
                const data = await commonService.getData(parameters, db.User);
                const userTypeCondition: sequelizeObj = {};
                userTypeCondition.where = {
                    LookupValueID: data.UserTypeId
                }
                const userType = await commonService.getData(userTypeCondition, db.lookupValue);
                const providerGroupCondition: sequelizeObj = {};
                providerGroupCondition.where = {
                    ProviderClientID: data.Id
                }
                const providerGroup = await commonService.getData(providerGroupCondition, db.ProviderGroup)
                if (userType.Name == appConstant.USER_TYPE[0] || appConstant.USER_TYPE[0]) {
                    data.UserType = userType.Name;
                } else {
                    return {
                        error: appConstant.ERROR_MESSAGE.NOT_USER
                    }
                }
                const jwtToken = authGuard.generateAuthToken(data);
                const finalData = _.pick(data, ['Id', 'UserId', 'Email', 'DisplayName', 'PasswordExpirationDate', 'UserType'])
                finalData.token = jwtToken;
                const finalres = {
                    data: encrypt(JSON.stringify(finalData))
                }
                logger.info(appConstant.LOGGER_MESSAGE.LOGIN_COMPLETED);
                return finalres;
            } else {
                logger.error(appConstant.ERROR_MESSAGE.INVALID_EMAIL)
                return {
                    error: appConstant.ERROR_MESSAGE.INVALID_EMAIL
                }
            }
        } catch (error) {
            logger.info(appConstant.LOGGER_MESSAGE.LOGIN_FAILED);
            logger.error(error)
        }
    }

    /**
    *for Foget password scenario need to verify the user and generate an email to the give email id 
   */
    async forgetPassword(email: string): Promise<void> {
        try {
            logger.info(appConstant.LOGGER_MESSAGE.FORGET_PASSWORD)
            const commonService = new CommonService(db.user);
            const templateFilePath = path.join(__dirname, '..', 'utils', 'templates', 'forgetpasswordtemplate.html');
            const templateFile = fs.readFileSync(templateFilePath, 'utf8');
            const emailValidation: sequelizeObj = {};
            emailValidation.where = {
                Email: email
            };
            const user = await commonService.getData(emailValidation, db.User);
            if (!_.isNil(user)) {
                const templateData = {
                    username: user.DisplayName,
                    userid: user.Id,
                    redirecturl: process.env.REDIRECT_URL
                };
                // Render the template with the updated data
                const renderedTemplate = ejs.render(templateFile, templateData);

                const currentDate = new Date();
                const expireDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
                // Create a transporter object
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_AUTH_USER,
                        pass: process.env.EMAIL_AUTH_PASSWORD
                    }
                });
                // Prepare the email options
                const mailOptions = {
                    from: process.env.FROM_EMAIL,
                    to: email,
                    subject: "Password Reset",
                    html: renderedTemplate
                };
                // Send the email
                transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
                    if (error) {
                        logger.error(appConstant.LOGGER_MESSAGE.EMAIL_SEND_FAILED)
                    } else {
                        logger.error(appConstant.LOGGER_MESSAGE.EMAIL_SEND)
                    }
                });

                logger.info(appConstant.LOGGER_MESSAGE.FORGET_PASSWORD_COMPLETED)
            } else {
                logger.info(appConstant.LOGGER_MESSAGE.USER_NOT_FOUND)
                throw new Error(appConstant.LOGGER_MESSAGE.USER_NOT_FOUND);

            }
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.FORGET_PASSWORD_FAILED)
            throw new Error(error.message);
        }
    }
}