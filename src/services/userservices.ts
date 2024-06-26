import { Request, Response } from 'express';
import { sequelizeObj } from '../helpers/sequelizeobj';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
import * as db from '../adapters/db';
import AuthGuard from '../middleware/authguard';
import { encrypt, decrypt } from '../helpers/aes';
import templates from '../utils/templates/index';
const logger = require('../helpers/logger');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
require('dotenv').config();
import _ from 'lodash';
import { Sequelize } from "sequelize";
const IORedis = require('ioredis');
import jwt from 'jsonwebtoken';
import moment from 'moment';

const appConstant = new AppConstants();

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
            const userEmailValidation: sequelizeObj = {
                where: { Email: userData.Email, IsActive: 1 }
            };
            const ProviderGroupValidation: sequelizeObj = {
                where: { Email: userData.Email, IsActive: 1 }
            };
            const ProviderDoctoreValidation: sequelizeObj = {
                where: { Email: userData.Email, IsActive: 1 }
            }
            const user = await commonService.getData(userEmailValidation, db.User);
            const providerGroupContact = await commonService.getData(ProviderGroupValidation, db.ProviderGroupContact);
            const provider = await commonService.getData(ProviderDoctoreValidation, db.ProviderDoctor);
            if ((user && user.PasswordHash) || (providerGroupContact && providerGroupContact.PasswordHash) || (provider && provider.PasswordHash)) {
                const providerData = user || providerGroupContact || provider;
                if (providerData.ForgotPwd == 1) {
                    logger.error(appConstant.MESSAGES.PASSWORD_RESET, '');
                    return ({ error: appConstant.MESSAGES.PASSWORD_RESET });
                }
                let password = await commonService.passwordHash(userData.PasswordHash, providerData);
                const currentData: any = await new Promise((resolve, reject) => {
                    redisClient.get(appConstant.REDIS_AUTH_TOKEN_KEYNAME, (getError: any, data: string) => {
                        if (getError) {
                            logger.error(appConstant.ERROR_MESSAGE.ERROR_FETCHING_TOKEN_DETAILS, getError);
                            reject(new Error(appConstant.ERROR_MESSAGE.TOKEN_FAILED));
                        } else {
                            resolve(data);
                        }
                    });
                }).catch((error: any) => { throw new Error(error) });
                const tokenDetailsArray = currentData ? JSON.parse(currentData) : [];
                const id = (user && user.Id) || (providerGroupContact && providerGroupContact.ProviderGroupID) || (provider && provider.ProviderDoctorID) || '';
                const TokenDetails = tokenDetailsArray.filter((item: any) => item.userid === id);
                if (user && password) {
                    const data: any = user;
                    const userTypeCondition: sequelizeObj = { where: { LookupValueID: data.UserTypeId, IsActive: 1 } };
                    const userType = await commonService.getData(userTypeCondition, db.lookupValue);
                    if (userType.Name === appConstant.USER_TYPE[0] || userType.Name === appConstant.USER_TYPE[1]) {
                        if (!_.isEmpty(TokenDetails) && !userData.signin) {
                            logger.info(appConstant.LOGGER_MESSAGE.USER_ALREADY_LOGEEDIN);
                            return {
                                data: encrypt(JSON.stringify({ multiLogin: true }))
                            }
                        } else if (!_.isNil(data.PasswordExpirationDate) && data.PasswordExpirationDate < new Date()) {
                            logger.info(appConstant.LOGGER_MESSAGE.PASSWORD_EXPIRED);
                            const responseData = {
                                Id: data.Id,
                                UserType: userType.Name,
                                PasswordExpire: true,
                            }
                            return {
                                data: encrypt(JSON.stringify(responseData))
                            }
                        } else {
                            const finalData: any = _.pick(data, ['Id', 'Email', 'ProviderClientID', 'ProviderGroupID']);
                            finalData.DisplayName = _.trim(data.DisplayName)
                            finalData.UserType = userType.Name;
                            finalData.ThemeCode = data.ThemeCode
                            const permissions = await this.getRolePermission(finalData.UserType as any);
                            finalData.UserPermissions = permissions;
                            let tokenData: any = {
                                ID: data.Id,
                                Email: data.Email,
                                user_type: userType.Name,
                                type: `User_${userType.Name}`,
                                DisplayName: data.DisplayName
                            };
                            const authtoken = commonService.generateAuthToken(tokenData);
                            finalData.token = authtoken;
                            finalData.multiLogin = false;
                            finalData.PasswordExpire = false;
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
                                        throw new Error(appConstant.ERROR_MESSAGE.TOKEN_FAILED);
                                    } else {
                                        console.log(appConstant.MESSAGES.TOEKN_DETAILS_STORED_SUCCESSFULLY, setResult);
                                        logger.info(appConstant.LOGGER_MESSAGE.TOKEN_OTHER_SERVICE_COMPLETED);
                                        resolve(setResult)
                                    }
                                });
                            }).catch((error: any) => { throw new Error(error) });
                            const userUpdateCondition = {
                                MobileDeviceID: userData.mobileDeviceID
                            }
                            await commonService.update({ id: data.Id }, userUpdateCondition, db.User)
                            return { data: encrypt(JSON.stringify(finalData)) };
                        }
                    } else {
                        return { error: appConstant.LOGGER_MESSAGE.USER_NOT_FOUND };
                    }
                } else if (providerGroupContact && password) {
                    const groupData: any = providerGroupContact;
                    if (!_.isEmpty(TokenDetails) && !userData.signin) {
                        logger.info(appConstant.LOGGER_MESSAGE.USER_ALREADY_LOGEEDIN);
                        return {
                            data: encrypt(JSON.stringify({ multiLogin: true }))
                        }
                    } else if (!_.isNil(groupData.PasswordExpirationDate) && groupData.PasswordExpirationDate < new Date()) {
                        logger.info(appConstant.LOGGER_MESSAGE.PASSWORD_EXPIRED);
                        const responseData = {
                            Id: groupData.ProviderGroupContactDetailID,
                            UserType: appConstant.USER_TYPE[0],
                            PasswordExpire: true,
                        }
                        return {
                            data: encrypt(JSON.stringify(responseData))
                        }
                    } else {
                        const finalData: any = _.pick(providerGroupContact, ['Email']);
                        finalData.Id = providerGroupContact.ProviderGroupID;
                        finalData.DisplayName = _.trim(groupData.ContactPerson);
                        finalData.UserType = appConstant.USER_TYPE[0];
                        const newTokenDetailsArray = tokenDetailsArray.filter((item: any) => item.userid !== providerGroupContact.ProviderGroupID);
                        const permissions = await this.getRolePermission(finalData.UserType as any);
                        finalData.UserPermissions = permissions;
                        finalData.ThemeCode = providerGroupContact.ThemeCode
                        let tokenData: any = {
                            ID: providerGroupContact.ProviderGroupID,
                            Email: providerGroupContact.Email,
                            user_type: appConstant.USER_TYPE[0],
                            type: appConstant.USER_TYPE[0],
                            DisplayName: providerGroupContact.ContactPerson,
                            ProviderGroupContactId: providerGroupContact.ProviderGroupContactDetailID
                        };
                        const authtoken = commonService.generateAuthToken(tokenData);
                        finalData.token = authtoken;
                        finalData.multiLogin = false;
                        finalData.PasswordExpire = false;
                        const TokenDetailsString = {
                            userid: providerGroupContact.ProviderGroupID,
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
                                    throw new Error(appConstant.ERROR_MESSAGE.TOKEN_FAILED);
                                } else {
                                    console.log(appConstant.MESSAGES.TOEKN_DETAILS_STORED_SUCCESSFULLY, setResult);
                                    logger.info(appConstant.LOGGER_MESSAGE.TOKEN_OTHER_SERVICE_COMPLETED);
                                    resolve(setResult)
                                }
                            });
                        }).catch((error: any) => { throw new Error(error) });
                        const userUpdateCondition = {
                            MobileDeviceID: userData.mobileDeviceID
                        }
                        await commonService.update({ ProviderGroupContactDetailID: providerGroupContact.ProviderGroupContactDetailID }, userUpdateCondition, db.ProviderGroupContact);
                        return { data: encrypt(JSON.stringify(finalData)) };
                    }
                } else if (provider && password) {
                    const data: any = provider;
                    if (!_.isEmpty(TokenDetails) && !userData.signin) {
                        logger.info(appConstant.LOGGER_MESSAGE.USER_ALREADY_LOGEEDIN);
                        return {
                            data: encrypt(JSON.stringify({ multiLogin: true }))
                        }
                    } else if (!_.isNil(data.PasswordExpirationDate) && data.PasswordExpirationDate < new Date()) {
                        logger.info(appConstant.LOGGER_MESSAGE.PASSWORD_EXPIRED);
                        const responseData = {
                            Id: data.ProviderDoctorID,
                            UserType: appConstant.USER_TYPE[1],
                            PasswordExpire: true,
                        }
                        return {
                            data: encrypt(JSON.stringify(responseData))
                        }
                    } else {
                        const finalData: any = _.pick(provider, ['Email']);
                        finalData.Id = provider.ProviderDoctorID;
                        finalData.DisplayName = `${_.trim(data.FirstName)} ${_.trim(data.LastName)}`
                        finalData.ThemeCode = provider.ThemeCode

                        let tokenData: any = {
                            ID: provider.ProviderDoctorID,
                            Email: data.Email,
                            user_type: appConstant.USER_TYPE[1],
                            type: appConstant.USER_TYPE[1],
                            DisplayName: `${provider.FirstName} ${provider.LastName}`
                        };
                        const authtoken = commonService.generateAuthToken(tokenData);
                        finalData.token = authtoken;
                        finalData.UserType = appConstant.USER_TYPE[1];
                        finalData.multiLogin = false;
                        finalData.PasswordExpire = false;
                        const TokenDetailsString = {
                            userid: data.ProviderDoctorID,
                            authToken: authtoken
                        }

                        const newTokenDetailsArray = tokenDetailsArray.filter((item: any) => item.userid !== data.Id);
                        // Push the new token details into the array
                        newTokenDetailsArray.push(TokenDetailsString);
                        const updatedTokenDetailsString = JSON.stringify(newTokenDetailsArray);
                        const permissions = await this.getRolePermission(finalData.UserType as any);
                        finalData.UserPermissions = permissions;
                        await new Promise((resolve, reject) => {
                            redisClient.set(appConstant.REDIS_AUTH_TOKEN_KEYNAME, updatedTokenDetailsString, (setError: any, setResult: any) => {
                                if (setError) {
                                    console.error(appConstant.ERROR_MESSAGE.ERROR_STORING_TOKEN_DETAILS, setError);
                                    reject(setError)
                                    throw new Error(appConstant.ERROR_MESSAGE.TOKEN_FAILED);
                                } else {
                                    console.log(appConstant.MESSAGES.TOEKN_DETAILS_STORED_SUCCESSFULLY, setResult);
                                    logger.info(appConstant.LOGGER_MESSAGE.TOKEN_OTHER_SERVICE_COMPLETED);
                                    resolve(setResult)
                                }
                            });
                        }).catch((error: any) => { throw new Error(error) });
                        const userUpdateCondition = {
                            MobileDeviceID: userData.mobileDeviceID
                        }
                        await commonService.update({ ProviderDoctorID: data.ProviderDoctorID }, userUpdateCondition, db.ProviderDoctor);
                        return { data: encrypt(JSON.stringify(finalData)) };
                    }
                } else {
                    logger.error(appConstant.LOGGER_MESSAGE.USER_NOT_FOUND);
                    const finres = {
                        error: appConstant.LOGGER_MESSAGE.USER_NOT_FOUND
                    }
                    return finres;
                }
            } else {
                logger.error(appConstant.LOGGER_MESSAGE.USER_NOT_FOUND);
                const finres = {
                    error: appConstant.LOGGER_MESSAGE.USER_NOT_FOUND
                }
                return finres;
            }
        } catch (error) {
            logger.info(appConstant.LOGGER_MESSAGE.LOGIN_FAILED);
            logger.error(error);
            throw new Error(appConstant.LOGGER_MESSAGE.USER_NOT_FOUND);
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
                Email: email,
                IsActive: 1
            };
            const user = await commonService.getData(emailValidation, db.User);
            const providerGroupContact = await commonService.getData(emailValidation, db.ProviderGroupContact);
            const provider = await commonService.getData(emailValidation, db.ProviderDoctor);
            const currentDate = new Date();
            const expireDate = new Date(currentDate);
            const expirationDate = expireDate.setDate(currentDate.getDate() + 60);
            const updateExpireDate = {
                PwdExpireDate: Sequelize.literal('CURRENT_TIMESTAMP'),
                ForgotPwd: 1,
                ForgetPwdCron: 1,
                PasswordExpirationDate: moment(expirationDate).format('YYYY-MM-DD HH:mm:ss.SSS'),
            }
            if (!_.isNil(user) || !_.isNil(providerGroupContact) || !_.isNil(provider)) {
                const type = user ? 'User' : providerGroupContact ? 'Group' : provider ? 'Provider' : null;
                const templateData = {
                    username: user.DisplayName,
                    userid: user ? user.Id : providerGroupContact ? providerGroupContact.ProviderGroupContactDetailID : provider.ProviderDoctorID,
                    redirecturl: process.env.FORGET_PASSWORD_REDIRECT_LINK,
                    userType: type
                };
                // Render the template with the updated data
                const renderedTemplate = ejs.render(templateFile, templateData);
                // Create a transporter object
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: true,
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
                        throw new Error(appConstant.LOGGER_MESSAGE.EMAIL_SEND_FAILED)
                    } else {
                        if (user) {
                            commonService.update({ Email: email }, updateExpireDate, db.User);
                        } else if (providerGroupContact) {
                            commonService.update({ Email: email }, updateExpireDate, db.ProviderGroupContact);
                        } else if (provider) {
                            commonService.update({ Email: email }, updateExpireDate, db.ProviderDoctor);
                        }
                        logger.info(appConstant.LOGGER_MESSAGE.EMAIL_SEND)
                        return appConstant.LOGGER_MESSAGE.EMAIL_SEND
                    }
                });
            } else {
                logger.info(appConstant.LOGGER_MESSAGE.EMAIL_NOT_FOUND)
                throw new Error(appConstant.LOGGER_MESSAGE.EMAIL_NOT_FOUND);
            }
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.FORGET_PASSWORD_FAILED)
            throw new Error(error.message);
        }
    }

    /**
     *for reset password scenario need to update the new password based on the user id 
     */
    async updatePassword(id: string, password: string, type: string, req: Request, res: Response, token: any): Promise<string> {
        try {
            logger.info(appConstant.LOGGER_MESSAGE.UPDATE_PASSWORD);
            const commonService = new CommonService(db.user);
            const passwordHash = await commonService.hashPassword(password);
            let decodedToken: any;
            if (token != '') {
                const secrectkey = `${process.env.JWT_SECREAT_KEK}`;
                decodedToken = jwt.verify(token, secrectkey);
            }
            if (type == 'User' || (decodedToken && (decodedToken.type == 'User_Group' || decodedToken.type == 'User_Provider'))) {
                const userCondition: sequelizeObj = {};
                userCondition.where = {
                    Id: id,
                    IsActive: 1
                };
                const userData = await commonService.getData(userCondition, db.User);
                const previousPasswordCheck = commonService.passwordHash(password, userData);
                if (previousPasswordCheck) {
                    return appConstant.MESSAGES.FAILED
                } else {
                    const userPasswordCondition = {
                        PasswordHash: passwordHash,
                        ForgotPwd: 0
                    }
                    const user = await commonService.update({ Id: id }, userPasswordCondition, db.User);
                    return appConstant.MESSAGES.SUCCESS
                }
            } else if (type == 'Group' || (decodedToken && decodedToken.type == 'Group')) {
                const groupCondition: sequelizeObj = {};
                if (token == '') {
                    groupCondition.where = {
                        ProviderGroupContactDetailID: id,
                        IsActive: 1
                    };
                }
                if (token != '') {
                    groupCondition.where = {
                        ProviderGroupContactDetailID: decodedToken.providerGroupContactId,
                        IsActive: 1
                    };
                }
                const groupData = await commonService.getData(groupCondition, db.ProviderGroupContact);
                if (!_.isNil(groupData.PasswordHash)) {
                    const previousPasswordCheck = commonService.passwordHash(password, groupData);
                    if (previousPasswordCheck) {
                        return appConstant.MESSAGES.FAILED
                    } else {
                        const groupPasswordCondition = {
                            PasswordHash: passwordHash,
                            ForgotPwd: 0
                        }
                        let update_Condition: any;
                        if (token == '') {
                            update_Condition = {
                                ProviderGroupContactDetailID: id
                            }
                        }
                        if (token != '') {
                            update_Condition = {
                                ProviderGroupContactDetailID: decodedToken.providerGroupContactId
                            }
                        }
                        const providerGroup = await commonService.update(update_Condition, groupPasswordCondition, db.ProviderGroupContact);
                        return appConstant.MESSAGES.SUCCESS
                    }
                } else {
                    const groupPasswordCondition = {
                        PasswordHash: passwordHash,
                        ForgotPwd: 0
                    }
                    let update_Condition: any;
                    if (token == '') {
                        update_Condition = {
                            ProviderGroupContactDetailID: id
                        }
                    }
                    if (token != '') {
                        update_Condition = {
                            ProviderGroupContactDetailID: decodedToken.providerGroupContactId
                        }
                    }
                    const providerGroup = await commonService.update(update_Condition, groupPasswordCondition, db.ProviderGroupContact);
                    return appConstant.MESSAGES.SUCCESS
                }
            } else if (type = 'Provider' || (decodedToken && decodedToken.type == 'Group')) {
                const doctorCondition: sequelizeObj = {};
                doctorCondition.where = {
                    ProviderDoctorID: id,
                    IsActive: 1
                };
                const doctorData = await commonService.getData(doctorCondition, db.ProviderDoctor);
                if (!_.isNil(doctorData.PasswordHash)) {
                    const previousPasswordCheck = commonService.passwordHash(password, doctorData);
                    if (previousPasswordCheck) {
                        return appConstant.MESSAGES.FAILED
                    } else {
                        const userCondition = {
                            PasswordHash: passwordHash,
                            ForgotPwd: 0
                        }
                        const provider = await commonService.update({ ProviderDoctorID: id }, userCondition, db.ProviderDoctor);
                        return appConstant.MESSAGES.SUCCESS
                    }
                } else {
                    const userCondition = {
                        PasswordHash: passwordHash,
                        ForgotPwd: 0
                    }
                    const provider = await commonService.update({ ProviderDoctorID: id }, userCondition, db.ProviderDoctor);
                    return appConstant.MESSAGES.SUCCESS
                }
            } else {
                return appConstant.MESSAGES.INVALID_USERTYPE;
            }
        } catch (error: any) {
            logger.info(appConstant.MESSAGES.FAILED);
            throw new Error(error);
        }
    }

    async getRolePermission(user_type: string): Promise<void> {
        try {
            const commonService = new CommonService(db.user);
            const mobile_role_permissions = await commonService.getAllList({ where: { RoleName: user_type, Status: appConstant.STATUS_ACTIVE }, attributes: ['RoleName', 'ScreenName', 'SubScreens', 'Permissions'] }, db.MobileRolePermissions);
            const permissions = !_.isNil(mobile_role_permissions) ? JSON.parse(JSON.stringify(mobile_role_permissions)) : null

            const groupedPermissions: Record<string, any> = {};

            await permissions.forEach((permission: any) => {

                const { RoleName, ScreenName, SubScreens, Permissions } = permission;

                if (!groupedPermissions[ScreenName]) {
                    groupedPermissions[ScreenName] = { RoleName, ScreenName, SubScreens, Permissions };
                } else {
                    groupedPermissions[ScreenName].SubScreens = SubScreens || groupedPermissions[ScreenName].SubScreens;
                    groupedPermissions[ScreenName].Permissions += `, ${Permissions}`;
                }

            });

            return !_.isNil(groupedPermissions) ? JSON.parse(JSON.stringify(groupedPermissions)) : null

        } catch (e) {
            logger.error(e);
        }
    }

    /**
    * Get Terms-of-service or Privacy-policy
    */
    async TermsofservicePrivacyPolicy(params: string): Promise<Record<string, any>> {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.LOGGER_MESSAGE.TERMS_OF)
            const page_url: string = params;
            const data = await commonService.getData({ where: { PageUrl: page_url } }, db.LoginCms);
            const cms_data = JSON.parse(JSON.stringify(data));
            if (!cms_data) {
                logger.error(appConstant.LOGGER_MESSAGE.PRIVACY_POLICY + appConstant.ERROR_MESSAGE.RECORD_NOT_FOUND)
                throw new Error(appConstant.ERROR_MESSAGE.RECORD_NOT_FOUND);
            }
            logger.info(appConstant.LOGGER_MESSAGE.TERMS_OF_SERVICE_COMPLETED);
            return cms_data;
        } catch (error: any) {
            logger.info(appConstant.LOGGER_MESSAGE.TERMS_OF_SERVICE_FAILED);
            throw new Error(error.message);
        }
    }

    /**
     * Used to get the profile information
     */
    async profileGet(data: any) {
        try {
            const commonService = new CommonService(db.user)
            let { id, type, email } = data;
            let finalRes: any;
            let first_name;
            let last_name;
            let profileimage;
            switch (type) {
                case appConstant.USER_TYPE[0]:
                    const providerGroupConiditon: sequelizeObj = {};
                    providerGroupConiditon.where = {
                        ProviderGroupID: id,
                        Email: email,
                        IsActive: 1
                    }
                    const providerGroupContact: any = await commonService.getData(providerGroupConiditon, db.ProviderGroupContact);
                    const nameParts = providerGroupContact.ContactPerson.split(" ");
                    const laname = nameParts.splice(nameParts.length - 1);
                    const index = nameParts.indexOf(laname);
                    if (index !== -1) {
                        nameParts.splice(index, 1);
                    }
                    first_name = nameParts.join(' ').trim();
                    last_name = laname.join(' ').trim();
                    finalRes = _.pick(providerGroupContact, ['Email']);
                    if (!_.isNil(providerGroupContact.ProfileImage)) {
                        profileimage = btoa(providerGroupContact.ProfileImage);
                        finalRes.ProfileImage = `data:image/png;base64, ${profileimage}`;
                    } else {
                        finalRes.ProfileImage = null
                    }
                    finalRes.FirstName = _.trim(first_name);
                    finalRes.LastName = _.trim(last_name);
                    return { data: encrypt(JSON.stringify(finalRes)) };
                case appConstant.USER_TYPE[1]:
                    const providerConiditon: sequelizeObj = {};
                    providerConiditon.where = {
                        ProviderDoctorID: id,
                        Email: email,
                        IsActive: 1
                    };
                    const provider: any = await commonService.getData(providerConiditon, db.ProviderDoctor);
                    finalRes = _.pick(provider, ['Email']);
                    if (!_.isNil(provider.ProfileImage)) {
                        profileimage = btoa(provider.ProfileImage);
                        finalRes.ProfileImage = `data:image/png;base64, ${profileimage}`;
                    } else {
                        finalRes.ProfileImage = null
                    }
                    finalRes.FirstName = _.trim(provider.FirstName);
                    finalRes.LastName = _.trim(provider.LastName);
                    return { data: encrypt(JSON.stringify(finalRes)) };
                case appConstant.USER_TYPE[2]:
                case appConstant.USER_TYPE[3]:
                    const userCondition: sequelizeObj = {};
                    userCondition.where = {
                        Id: id,
                        Email: email,
                        IsActive: 1
                    }
                    const user: any = await commonService.getData(userCondition, db.User);
                    finalRes = _.pick(user, ['Email']);
                    if (!_.isNil(user.ProfileImage)) {
                        profileimage = btoa(user.ProfileImage);
                        finalRes.ProfileImage = `data:image/png;base64, ${profileimage}`;
                    } else {
                        finalRes.ProfileImage = null
                    }
                    finalRes.FirstName = _.trim(user.FirstName);
                    finalRes.LastName = _.trim(user.LastName);
                    return { data: encrypt(JSON.stringify(finalRes)) };
                default:
                    return { data: encrypt(JSON.stringify(appConstant.MESSAGES.INVALID_USERTYPE)) };
            }
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.PROFILE_GET_FAILED, error.message);
            throw new Error(error.message);
        }
    }

    /**
     * User Update function
     */
    async profileUpdate(data: any, image: any) {
        try {
            const commonService = new CommonService(db.user);
            let finalRes: any;
            let FirstName;
            let LastName;
            let pimage;
            FirstName = data.FirstName ? data.FirstName : null;
            LastName = data.LastName ? data.LastName : null;
            pimage = image ? image : null
            switch (data.type) {
                case appConstant.USER_TYPE[0]:
                    const contactPerson = data.FirstName && data.LastName ? `${data.FirstName} ${data.LastName}` : null;
                    const providerGroupUpdateCondition: any = {}
                    if (!_.isNil(pimage)) {
                        providerGroupUpdateCondition.ProfileImage = pimage
                    }
                    if (_.isNil(pimage) && data.imgremove) {
                        providerGroupUpdateCondition.ProfileImage = Sequelize.literal('NULL') // Use Sequelize's literal method
                    }
                    if (!_.isNil(contactPerson)) {
                        providerGroupUpdateCondition.ContactPerson = contactPerson
                    }
                    await commonService.update({ ProviderGroupContactDetailID: data.providergroupcontactid }, providerGroupUpdateCondition, db.ProviderGroupContact);
                    return { data: encrypt(JSON.stringify(appConstant.MESSAGES.PROFILE_UPDATE_SUCCESSFUL)) }
                case appConstant.USER_TYPE[1]:
                    const providerUpdateConiditon: any = {}
                    if (!_.isNil(pimage)) {
                        providerUpdateConiditon.ProfileImage = pimage
                    }
                    if (_.isNil(pimage) && data.imgremove) {
                        providerUpdateConiditon.ProfileImage = Sequelize.literal('NULL') // Use Sequelize's literal method
                    }
                    if (!_.isNil(FirstName) && !_.isNil(LastName)) {
                        providerUpdateConiditon.FirstName = FirstName,
                            providerUpdateConiditon.LastName = LastName
                    }
                    await commonService.update({ ProviderDoctorID: data.id }, providerUpdateConiditon, db.ProviderDoctor);
                    return { data: encrypt(JSON.stringify(appConstant.MESSAGES.PROFILE_UPDATE_SUCCESSFUL)) }
                case appConstant.USER_TYPE[2]:
                case appConstant.USER_TYPE[3]:
                    const userUpdateCondition: any = {}
                    if (!_.isNil(pimage)) {
                        userUpdateCondition.ProfileImage = pimage
                    }
                    if (_.isNil(pimage) && data.imgremove) {
                        userUpdateCondition.ProfileImage = Sequelize.literal('NULL') // Use Sequelize's literal method
                    }
                    if (!_.isNil(FirstName) && !_.isNil(LastName)) {
                        userUpdateCondition.FirstName = FirstName,
                            userUpdateCondition.LastName = LastName,
                            userUpdateCondition.DisplayName = `${data.FirstName} ${data.LastName}`
                    }
                    await commonService.update({ ID: data.id }, userUpdateCondition, db.User);
                    return { data: encrypt(JSON.stringify(appConstant.MESSAGES.PROFILE_UPDATE_SUCCESSFUL)) }
                default:
                    return appConstant.MESSAGES.INVALID_USERTYPE;
            }
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.PROFILE_UPDATE_FAILED, error.message);
            throw new Error(appConstant.LOGGER_MESSAGE.PROFILE_UPDATE_FAILED);
        }
    }

    /**
     * Logout funcation
     */
    async logOut(data: any) {
        try {
            const { id } = data;
            const currentData: any = await new Promise((resolve, reject) => {
                redisClient.get(appConstant.REDIS_AUTH_TOKEN_KEYNAME, (getError: any, data: string) => {
                    if (getError) {
                        logger.error(appConstant.ERROR_MESSAGE.ERROR_FETCHING_TOKEN_DETAILS, getError);
                        reject(new Error(appConstant.ERROR_MESSAGE.TOKEN_FAILED));
                    } else {
                        resolve(data);
                    }
                });
            }).catch((error: any) => { throw new Error(error) });
            const tokenDetailsArray = currentData ? JSON.parse(currentData) : [];
            const newTokenDetailsArray = tokenDetailsArray.filter((item: any) => item.userid !== id);
            const updatedTokenDetailsString = JSON.stringify(newTokenDetailsArray);
            await new Promise((resolve, reject) => {
                redisClient.set(appConstant.REDIS_AUTH_TOKEN_KEYNAME, updatedTokenDetailsString, (setError: any, setResult: any) => {
                    if (setError) {
                        console.error(appConstant.ERROR_MESSAGE.ERROR_STORING_TOKEN_DETAILS, setError);
                        reject(setError)
                        throw new Error(appConstant.ERROR_MESSAGE.TOKEN_FAILED);
                    } else {
                        console.log(appConstant.MESSAGES.TOKEN_DELETED_SUCCESSFULLY, setResult);
                        logger.info(appConstant.LOGGER_MESSAGE.TOKEN_OTHER_SERVICE_COMPLETED);
                        resolve(setResult)
                    }
                });
            }).catch((error: any) => { throw new Error(error) });
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.PROFILE_GET_FAILED, error.message);
            throw new Error(appConstant.LOGGER_MESSAGE.PROFILE_GET_FAILED);
        }
    }

    /**
     * Password expiration check
     */
    async pwdExpirationCheck(id: string, type: string) {
        try {
            const commonService = new CommonService(db.user);
            switch (type) {
                case appConstant.USER_TYPE[0]:
                    const groupCondition: sequelizeObj = {};
                    groupCondition.where = {
                        ProviderGroupContactDetailID: id,
                        IsActive: 1
                    };
                    const providerGroup: any = await commonService.getData(groupCondition, db.ProviderGroupContact);
                    if (providerGroup.PwdExpireDate >= new Date() && providerGroup.ForgotPwd === 1) {
                        logger.info(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_COMPLETED);
                        return {
                            message: appConstant.MESSAGES.PWD_NOT_EXPIRED,
                        }
                    }
                    else {
                        logger.error(appConstant.MESSAGES.PWD_EXPIRED);
                        throw new Error(appConstant.MESSAGES.PWD_EXPIRED);
                    }
                case appConstant.USER_TYPE[1]:
                    const providerConiditon: sequelizeObj = {};
                    providerConiditon.where = {
                        ProviderDoctorID: id,
                        IsActive: 1
                    };
                    const provider: any = await commonService.getData(providerConiditon, db.ProviderDoctor);
                    if (provider.PwdExpireDate >= new Date() && provider.ForgotPwd === 1) {
                        logger.info(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_COMPLETED);
                        return {
                            message: appConstant.MESSAGES.PWD_NOT_EXPIRED,
                        }
                    }
                    else {
                        logger.error(appConstant.MESSAGES.PWD_EXPIRED);
                        throw new Error(appConstant.MESSAGES.PWD_EXPIRED);
                    }
                case appConstant.USER_TYPE[2]:
                case appConstant.USER_TYPE[3]:
                    const userCondition: sequelizeObj = {};
                    userCondition.where = {
                        Id: id,
                        IsActive: 1
                    };
                    const userData: any = await commonService.getData(userCondition, db.User);
                    if (userData.PwdExpireDate >= new Date() && userData.ForgotPwd === 1) {
                        logger.info(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_COMPLETED);
                        return {
                            message: appConstant.MESSAGES.PWD_NOT_EXPIRED,
                        }
                    }
                    else {
                        logger.error(appConstant.MESSAGES.PWD_EXPIRED);
                        throw new Error(appConstant.MESSAGES.PWD_EXPIRED);
                    }
                default:
                    return appConstant.MESSAGES.INVALID_USERTYPE;
            }
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_FAILED, error.message);
            throw new Error(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_FAILED);
        }
    }

    /**
     * Password Genration using cron
     */
    async generatePasswordCron() {
        try {
            const commonService = new CommonService(db.user);
            const provider_condition: sequelizeObj = {};
            const templateFile = templates.newpasswordtemplate
            provider_condition.where = {
                GenerateCronPassword: 0,
                ForgetPwdCron: 0
            }
            const provider = await commonService.getAllList(provider_condition, db.ProviderDoctor);
            const group_provider = await commonService.getAllList(provider_condition, db.ProviderGroupContact);
            const provider_list = JSON.parse(JSON.stringify(provider));
            const group_provider_list = JSON.parse(JSON.stringify(group_provider));
            const final_array = provider_list.concat(group_provider_list);
            final_array.map(async (user: any) => {
                const password = await commonService.randomPassword();
                const templateData: any = {
                    redirecturl: process.env.LOGIN_LINK,
                    password: password
                };
                const hashedPassword = await commonService.hashPassword(password);
                if (user.ProviderDoctorID) {
                    templateData.username = `${user.FirstName} ${user.MiddleName} ${user.LastName}`;
                } else {
                    templateData.username = user.ContactPerson
                }
                // Render the template with the updated data
                const renderedTemplate = ejs.render(templateFile, templateData);
                // Create a transporter object
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_AUTH_USER,
                        pass: process.env.EMAIL_AUTH_PASSWORD
                    }
                });
                // Prepare the email options
                const mailOptions = {
                    from: process.env.FROM_EMAIL,
                    to: user.Email,
                    subject: appConstant.MESSAGES.RESET_PASSWORD_SUB,
                    html: renderedTemplate
                };
                // Send the email
                transporter.sendMail(mailOptions, async function (error: any, info: { response: string; }) {
                    if (error) {
                        logger.error(appConstant.LOGGER_MESSAGE.EMAIL_SEND_FAILED)
                        throw new Error(appConstant.LOGGER_MESSAGE.EMAIL_SEND_FAILED)
                    } else {
                        const update_condition = {
                            GenerateCronPassword: 1,
                            ForgetPwdCron: 1,
                            PasswordHash: hashedPassword
                        }
                        logger.info(appConstant.LOGGER_MESSAGE.EMAIL_SEND);
                        if (user.ProviderDoctorID) {
                            await commonService.update({ providerDoctorID: user.ProviderDoctorID }, update_condition, db.ProviderDoctor);
                        } else {
                            await commonService.update({ ProviderGroupContactDetailID: user.ProviderGroupContactDetailID }, update_condition, db.ProviderGroupContact);
                        }
                        return appConstant.LOGGER_MESSAGE.EMAIL_SEND
                    }
                });
            })
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_FAILED, error.message);
            throw new Error(appConstant.LOGGER_MESSAGE.PWD_EXPIERATION_FAILED);
        }
    }

    async updateTheme(data: any, theme: any) {
        try {
            const commonService = new CommonService(db.user);
            let finalRes: any;
            let ptheme;
            ptheme = theme ? theme : null
            switch (data.type) {
                case appConstant.USER_TYPE[0]:
                    const providerGroupUpdateCondition: any = {}
                    if (!_.isNil(ptheme)) {
                        providerGroupUpdateCondition.ThemeCode = ptheme
                    }
                    await commonService.update({ ProviderGroupContactDetailID: data.providergroupcontactid }, providerGroupUpdateCondition, db.ProviderGroupContact);
                    return { data: encrypt(JSON.stringify(appConstant.LOGGER_MESSAGE.THEME_UPDATE_SUCCESSFULLY)) }
                case appConstant.USER_TYPE[1]:
                    const providerUpdateConiditon: any = {}
                    if (!_.isNil(ptheme)) {
                        providerUpdateConiditon.ThemeCode = ptheme
                    }
                    await commonService.update({ ProviderDoctorID: data.id }, providerUpdateConiditon, db.ProviderDoctor);
                    return { data: encrypt(JSON.stringify(appConstant.LOGGER_MESSAGE.THEME_UPDATE_SUCCESSFULLY)) }
                case appConstant.USER_TYPE[2]:
                case appConstant.USER_TYPE[3]:
                    const userUpdateCondition: any = {}
                    if (!_.isNil(ptheme)) {
                        userUpdateCondition.ThemeCode = ptheme
                    }
                    await commonService.update({ Id: data.id }, userUpdateCondition, db.User);
                    return { data: encrypt(JSON.stringify(appConstant.LOGGER_MESSAGE.THEME_UPDATE_SUCCESSFULLY)) }
                default:
                    return appConstant.MESSAGES.INVALID_USERTYPE;
            }
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.THEME_UPDATE_FAILED, error.message);
            throw new Error(appConstant.LOGGER_MESSAGE.THEME_UPDATE_FAILED);
        }
    }

    async AppVersionInfo(): Promise<Record<string, any>> {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.LOGGER_MESSAGE.APP_VERSION_FUNCTION_STARTED)
            const data = await commonService.getData({ where: { isLatest: 1 } }, db.MobileAppVersion);
            const cms_data = JSON.parse(JSON.stringify(data));
            logger.info(appConstant.LOGGER_MESSAGE.APP_VERSION_FUNCTION_COMPLETED);
            return cms_data;
        } catch (error: any) {
            logger.info(appConstant.LOGGER_MESSAGE.TERMS_OF_SERVICE_FAILED);
            throw new Error(error.message);
        }
    }



}