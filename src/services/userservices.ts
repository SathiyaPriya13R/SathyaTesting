import { Request, Response } from 'express';
import { sequelizeObj } from '../helpers/sequelizeobj';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
import * as db from '../adapters/db';
import AuthGuard from '../middleware/authguard';
import { encrypt } from '../helpers/aes';
import templates from '../utils/templates/index';
import path from 'path';
const logger = require('../helpers/logger');
const fs = require('fs');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const _ = require("lodash");
const IORedis = require('ioredis');

const appConstant = new AppConstants();
const authGuard = new AuthGuard();

const redisClient = new IORedis({
    host: process.env.REDIS_SERVER_IP,
    port: process.env.REDIS_SERVER_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_SERVER_DEFAULT_DB,
});

export default class UserService {
    /**
     * User Payer - Method
     */
    async signinUser(userData: Record<string, any>): Promise<any> {
        try {
            logger.info(appConstant.LOGGER_MESSAGE.LOGIN_STARTED);
            const commonService = new CommonService(db.user);
            const emailValidation: sequelizeObj = {
                where: { Email: userData.Email }
            };

            const user = await commonService.getData(emailValidation, db.User);
            const providerGroupContact = await commonService.getData(emailValidation, db.ProviderGroupContact);
            const provider = await commonService.getData(emailValidation, db.ProviderDoctor);
            console.log('user ------',JSON.parse(JSON.stringify(user)));
            console.log('providerGroupContact ------',JSON.parse(JSON.stringify(providerGroupContact)));
            console.log('provider ------',JSON.parse(JSON.stringify(provider)));
            if ((user && user.PasswordHash) || (providerGroupContact && providerGroupContact.PasswordHash) || (provider && provider.PasswordHash)) {
                const providerData = user || providerGroupContact || provider;
                let password = await commonService.passwordHash(userData.PasswordHash, providerData);
                console.log('passw0rd ----',password);
                const currentData: any = await new Promise((resolve, reject) => {
                    redisClient.get(appConstant.REDIS_AUTH_TOKEN_KEYNAME, (getError: any, data: string) => {
                        if (getError) {
                            logger.error(appConstant.ERROR_MESSAGE.ERROR_FETCHING_TOKEN_DETAILS, getError);
                            reject(new Error(appConstant.ERROR_MESSAGE.MIST_TOKEN_FAILED));
                        } else {
                            resolve(data);
                        }
                    });
                }).catch((error: any) => { throw new Error(error) });
                const tokenDetailsArray = currentData ? JSON.parse(currentData) : [];
                if (user && password) {
                    console.log('user ------');
                    const data = user;
                    const userTypeCondition: sequelizeObj = { where: { LookupValueID: data.UserTypeId } };
                    const userType = await commonService.getData(userTypeCondition, db.lookupValue);
                    if (userType.Name === appConstant.USER_TYPE[0] || userType.Name === appConstant.USER_TYPE[1]) {
                        const finalData = _.pick(data, ['Id', 'UserId', 'Email', 'DisplayName', 'PasswordExpirationDate', 'ProfileImage']);
                        finalData.UserType = userType.Name;
                        const authtoken = authGuard.generateAuthToken(data);
                        finalData.token = authtoken;
                        const TokenDetailsString = {
                            userid: data.Id,
                            authToken: authtoken
                        }
                        const newTokenDetailsArray = tokenDetailsArray.filter((item: any) => item.userid !== data.Id);
                        // Push the new token details into the array
                        newTokenDetailsArray.push(TokenDetailsString);
                        const updatedTokenDetailsString = JSON.stringify(newTokenDetailsArray);
                        await new Promise((resolve, reject) => {
                            redisClient.set(appConstant.REDIS_AUTH_TOKEN_KEYNAME, updatedTokenDetailsString, (setError: any, setResult: any) => {
                                if (setError) {
                                    console.error(appConstant.ERROR_MESSAGE.ERROR_STORING_TOKEN_DETAILS, setError);
                                    reject(setError)
                                    throw new Error(appConstant.ERROR_MESSAGE.MIST_TOKEN_FAILED);
                                } else {
                                    console.log(appConstant.MESSAGES.TOEKN_DETAILS_STORED_SUCCESSFULLY, setResult);
                                    logger.info(appConstant.LOGGER_MESSAGE.MIST_TOKEN_OTHER_SERVICE_COMPLETED);
                                    resolve(setResult)
                                }
                            });
                        }).catch((error: any) => { throw new Error(error) });
                        return { data: encrypt(JSON.stringify(finalData)) };
                    } else {
                        return { error: appConstant.ERROR_MESSAGE.NOT_USER };
                    }
                } else if (providerGroupContact && password) {
                    const parameters: sequelizeObj = { where: { ProviderGroupID: providerGroupContact.ProviderGroupID } };
                    const data = await commonService.getData(parameters, db.ProviderGroup);
                    const finalData = _.pick(data, ['ProviderGroupID', 'Name', 'Email', 'UserType', 'ProfileImage']);
                    const newTokenDetailsArray = tokenDetailsArray.filter((item: any) => item.userid !== data.Id);
                    const authtoken = authGuard.generateAuthToken(data);
                    finalData.token = authtoken;
                    const TokenDetailsString = {
                        userid: data.ProviderGroupContactDetailID,
                        authToken: authtoken
                    }
                    // Push the new token details into the array
                    newTokenDetailsArray.push(TokenDetailsString);
                    const updatedTokenDetailsString = JSON.stringify(newTokenDetailsArray);
                    await new Promise((resolve, reject) => {
                        redisClient.set(appConstant.REDIS_AUTH_TOKEN_KEYNAME, updatedTokenDetailsString, (setError: any, setResult: any) => {
                            if (setError) {
                                console.error(appConstant.ERROR_MESSAGE.ERROR_STORING_TOKEN_DETAILS, setError);
                                reject(setError)
                                throw new Error(appConstant.ERROR_MESSAGE.MIST_TOKEN_FAILED);
                            } else {
                                console.log(appConstant.MESSAGES.TOEKN_DETAILS_STORED_SUCCESSFULLY, setResult);
                                logger.info(appConstant.LOGGER_MESSAGE.MIST_TOKEN_OTHER_SERVICE_COMPLETED);
                                resolve(setResult)
                            }
                        });
                    }).catch((error: any) => { throw new Error(error) });
                    finalData.UserType = appConstant.USER_TYPE[0];
                    return { data: encrypt(JSON.stringify(finalData)) };
                } else if (provider && password) {
                    const data = provider;
                    const finalData = _.pick(provider, ['ProviderDoctorID', 'Name', 'Email', 'UserType', 'ProfileImage']);
                    const authtoken = authGuard.generateAuthToken(data);
                    finalData.token = authtoken;
                    const TokenDetailsString = {
                        userid: data.ProviderDoctorID,
                        authToken: authtoken
                    }
                    const newTokenDetailsArray = tokenDetailsArray.filter((item: any) => item.userid !== data.Id);
                    // Push the new token details into the array
                    newTokenDetailsArray.push(TokenDetailsString);
                    const updatedTokenDetailsString = JSON.stringify(newTokenDetailsArray);
                    await new Promise((resolve, reject) => {
                        redisClient.set(appConstant.REDIS_AUTH_TOKEN_KEYNAME, updatedTokenDetailsString, (setError: any, setResult: any) => {
                            if (setError) {
                                console.error(appConstant.ERROR_MESSAGE.ERROR_STORING_TOKEN_DETAILS, setError);
                                reject(setError)
                                throw new Error(appConstant.ERROR_MESSAGE.MIST_TOKEN_FAILED);
                            } else {
                                console.log(appConstant.MESSAGES.TOEKN_DETAILS_STORED_SUCCESSFULLY, setResult);
                                logger.info(appConstant.LOGGER_MESSAGE.MIST_TOKEN_OTHER_SERVICE_COMPLETED);
                                resolve(setResult)
                            }
                        });
                    }).catch((error: any) => { throw new Error(error) });
                    finalData.UserType = appConstant.USER_TYPE[1];
                    return { data: encrypt(JSON.stringify(finalData)) };
                } else {
                    logger.error(appConstant.ERROR_MESSAGE.INVALID_EMAIL);
                    return { data: encrypt(JSON.stringify({ error: appConstant.ERROR_MESSAGE.INVALID_EMAIL })) };
                }
            } else {
                throw new Error(appConstant.LOGGER_MESSAGE.USER_NOT_FOUND);
            }
        } catch (error) {
            logger.info(appConstant.LOGGER_MESSAGE.LOGIN_FAILED);
            logger.error(error);
        }
    }

    /**
    *for Foget password scenario need to verify the user and generate an email to the give email id 
   */
    async forgetPassword(email: string): Promise<void> {
        try {
            logger.info(appConstant.LOGGER_MESSAGE.FORGET_PASSWORD)
            const commonService = new CommonService(db.user)
            const templateFile = templates.forgetpasswordtemplate
            const emailValidation: sequelizeObj = {};
            emailValidation.where = {
                Email: email
            };
            const user = await commonService.getData(emailValidation, db.User);
            const providerGroupContact = await commonService.getData(emailValidation, db.ProviderGroupContact);
            const provider = await commonService.getData(emailValidation, db.ProviderDoctor);
            if (!_.isNil(user) || !_.isNil(providerGroupContact) || !_.isNil(provider)) {
                const type = user ? 'user' : providerGroupContact ? 'group' : provider ? 'provider' : null;
                const templateData = {
                    username: user.DisplayName,
                    userid: user ? user.Id : providerGroupContact ? providerGroupContact.ProviderGroupContactDetailID : provider.ProviderDoctorID,
                    redirecturl: process.env.FORGET_PASSWORD_REDIRECT_LINK,
                    userType: type
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
                    subject: appConstant.MESSAGES.RESET_PASSWORD_SUB,
                    html: renderedTemplate
                };
                // Send the email
                transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
                    if (error) {
                        logger.error(appConstant.LOGGER_MESSAGE.EMAIL_SEND_FAILED)
                    } else {
                        logger.info(appConstant.LOGGER_MESSAGE.EMAIL_SEND)
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

    /**
     *for reset password scenario need to update the new password based on the user id 
    */
    async updatePassword(id: string, password: string, type: string, req: Request, res: Response): Promise<string> {
        try {
            logger.info(appConstant.LOGGER_MESSAGE.UPDATE_PASSWORD);
            const commonService = new CommonService(db.user);
            const passwordHash = await commonService.hashPassword(password);
            if (type == 'user') {
                const userCondition: sequelizeObj = {};
                userCondition.where = {
                    Id: id
                };
                const userData = await commonService.getData(userCondition, db.User);
                const previousPasswordCheck = commonService.passwordHash(password, userData);
                if (previousPasswordCheck) {
                    return appConstant.MESSAGES.FAILED
                } else {
                    const userPasswordCondition = {
                        PasswordHash: passwordHash
                    }
                    const user = await commonService.update({ Id: id }, userPasswordCondition, db.User);
                    return appConstant.MESSAGES.SUCCESS
                }
            } else if (type == 'group') {
                const groupCondition: sequelizeObj = {};
                groupCondition.where = {
                    ProviderGroupContactDetailID: id
                };
                const groupData = await commonService.getData(groupCondition, db.ProviderGroupContact);
                const previousPasswordCheck = commonService.passwordHash(password, groupData);
                if (previousPasswordCheck) {
                    return appConstant.MESSAGES.FAILED
                } else {
                    const groupPasswordCondition = {
                        PasswordHash: passwordHash
                    }
                    const providerGroup = await commonService.update({ ProviderGroupContactDetailID: id }, groupPasswordCondition, db.ProviderGroupContact);
                    return appConstant.MESSAGES.SUCCESS
                }
            } else if (type = 'doctor') {
                const doctorCondition: sequelizeObj = {};
                doctorCondition.where = {
                    ProviderDoctorID: id
                };
                const doctorData = await commonService.getData(doctorCondition, db.ProviderDoctor);
                const previousPasswordCheck = commonService.passwordHash(password, doctorData);
                if (previousPasswordCheck) {
                    return appConstant.MESSAGES.FAILED
                } else {
                    const userCondition = {
                        PasswordHash: passwordHash
                    }
                    const provider = await commonService.update({ ProviderDoctorID: id }, userCondition, db.ProviderDoctor);
                    return appConstant.MESSAGES.SUCCESS
                }
            } else {
                return appConstant.MESSAGES.FAILED
            }
        } catch (error: any) {
            logger.info(appConstant.MESSAGES.FAILED);
            throw new Error(error.message);
        }
    }
}