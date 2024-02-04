import * as db from '../adapters/db';
import sequelize = require('sequelize');
import { sequelizeObj } from '../helpers/sequelizeobj';
import CommonService from '../helpers/commonService';
import AppConstants from "../utils/constants";
import { queries } from '../utils/queries';
import _ from 'lodash';
import { encrypt } from '../helpers/aes';
const logger = require('../helpers/logger');

const appConstant = new AppConstants();

export default class DashboardService {

    /**
     * For get statistics count - payer enrollment status.
     */
    async getStatisticsCount(user_data: { id: string, user_type: string }, data: { statistics_type: string, providers: Array<string>, payers: Array<string>, locations: Array<string>, year_month: string, week_number: number }): Promise<any> {
        try {
            const commonService = new CommonService(db.user)
            const queryparams = {} as sequelizeObj;
            const querystring = (data.statistics_type == appConstant.STATISTICS_TYPE[0]) ? queries.month_wise_statistics_count : queries.week_wise_statistics_count;

            const user_object = await commonService.getData({ where: { Id: user_data.id }, attributes: ['Id', 'ProviderGroupID'] }, db.User);
            const user_obj = JSON.parse(JSON.stringify(user_object));

            if (!_.isNil(user_obj) && (user_data.user_type === appConstant.USER_TYPE[0])) {
                user_data.id = !_.isNil(user_obj.ProviderGroupID) ? user_obj.ProviderGroupID : null;
            }

            if (!_.isNil(user_obj) && (user_data.user_type === appConstant.USER_TYPE[1])) {
                const usr_pvdrgrp_data = await commonService.getData({ where: { UserID: user_obj.Id }, attributes: ['ProviderDoctorID'] }, db.UserProvider);
                const provider_id: { ProviderDoctorID: string } = !_.isNil(usr_pvdrgrp_data) ? JSON.parse(JSON.stringify(usr_pvdrgrp_data)) : null
                user_data.id = provider_id.ProviderDoctorID
            }

            if (user_data.user_type === appConstant.USER_TYPE[1]) {
                data.providers.push(user_data.id);
            }

            queryparams.type = sequelize.QueryTypes.SELECT;
            queryparams.replacements = {
                user_id: user_data.id,
                user_type: user_data.user_type,
                month: data.year_month,
                providers: data.providers,
                payers: data.payers,
                locations: data.locations
            };

            if ((data.statistics_type == appConstant.STATISTICS_TYPE[1])) {
                queryparams.replacements.week_number = data.week_number;
            }

            const statistics = await commonService.executeQuery(querystring, queryparams);
            const statistic_count = JSON.parse(JSON.stringify(statistics));

            if (statistic_count && !_.isNil(statistic_count) && !_.isEmpty(statistic_count)) {
                return { data: statistic_count, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.DASHBOARD_STATISTICS) };
            } else {
                return { data: statistic_count, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.DASHBOARD_STATISTICS) };
            }

        } catch (error: any) {
            logger.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * For get the count of provider, location, payer
     */
    async getDashBoardSummary(data: any) {
        try {
            logger.info(appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_STARTED);
            const commonService = new CommonService(db.user);
            let payerCondition: sequelizeObj = {};
            let providerCondition: sequelizeObj = {};
            let locationCondition: sequelizeObj = {};
            let finalRes = {};
            let provider, payer, location = [];
            let payerUniq = [];
            const { type, id } = data;
            console.log('type ----',type)
            switch (type) {
                case appConstant.USER_TYPE[0]:
                    providerCondition.where = {
                        ProviderGroupID: id,
                        isActive: 1,
                    };
                    provider = await commonService.getAllList(providerCondition, db.ProviderDoctor);
                    payerCondition.where = {
                        ProviderGroupID: id,
                        isActive: 1,
                    };
                    payer = await commonService.getAllList(payerCondition, db.GroupInsurance);
                    locationCondition.where = {
                        ProviderGroupID: id,
                        isActive: 1,
                    };
                    location = await commonService.getAllList(locationCondition, db.Location);
                    finalRes = {
                        provider: provider.length,
                        payer: payer.length,
                        location: location.length
                    }
                    logger.info(appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_COMPLETED);
                    return { data: encrypt(JSON.stringify(finalRes)) };
                case appConstant.USER_TYPE[1]:
                    providerCondition.where = {
                        ProviderDoctorID: id,
                        isActive: 1,
                    };
                    provider = await commonService.getAllList(providerCondition, db.ProviderDoctor);
                    payerCondition.where = {
                        ProviderDoctorID: id,
                        isActive: 1,
                    };
                    payer = await commonService.getAllList(payerCondition, db.InsuranceTransaction);
                    payerUniq = _.uniqBy(payer, 'GroupInsuranceID');
                    locationCondition.where = {
                        ProviderDoctorID: id,
                        isActive: 1,
                    };
                    location = await commonService.getAllList(locationCondition, db.DoctorLocation);
                    finalRes = {
                        provider: provider.length,
                        payer: payerUniq.length,
                        location: location.length
                    }
                    logger.info(appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_COMPLETED);
                    return { data: encrypt(JSON.stringify(finalRes)) };
                case appConstant.USER_TYPE[2]:
                    providerCondition.where = {
                        ProviderDoctorID: id,
                        isActive: 1,
                    };
                    provider = await commonService.getData(providerCondition, db.UserProvider);
                    payerCondition.where = {
                        ProviderDoctorID: provider.ProviderDoctorID,
                        isActive: 1,
                    };
                    payer = await commonService.getAllList(payerCondition, db.InsuranceTransaction);
                    payerUniq = _.uniqBy(payer, 'GroupInsuranceID');
                    locationCondition.where = {
                        ProviderDoctorID: provider.ProviderDoctorID,
                        isActive: 1,
                    };
                    location = await commonService.getAllList(locationCondition, db.DoctorLocation);
                    finalRes = {
                        provider: [provider].length,
                        payer: payerUniq.length,
                        location: location.length
                    }
                    logger.info(appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_COMPLETED);

                    return { data: encrypt(JSON.stringify(finalRes)) };
                case appConstant.USER_TYPE[3]:
                    console.log('67890-')
                    providerCondition.where = {
                        ProviderGroupID: id,
                        isActive: 1,
                    };
                    provider = await commonService.getData(providerCondition, db.UserProviderGroup);
                    payerCondition.where = {
                        ProviderGroupID: provider.ProviderGroupID,
                        isActive: 1,
                    };
                    payer = await commonService.getAllList(payerCondition, db.GroupInsurance);
                    locationCondition.where = {
                        ProviderGroupID: provider.ProviderGroupID,
                        isActive: 1,
                    };
                    location = await commonService.getAllList(locationCondition, db.Location);
                    finalRes = {
                        provider: [provider].length,
                        payer: payer.length,
                        location: location.length
                    }
                    logger.info(appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_COMPLETED);
                    return { data: encrypt(JSON.stringify(finalRes)) };
                default:
                    return appConstant.MESSAGES.INVALID_USERTYPE;
            }
        } catch (error: any) {
            logger.error(error.message);
            throw new Error(error.message)
        }
    }

    /**
     * This function used to get providers, payers and locations data for app filter.
     */
    async getAppFilterData(user_data: { id: string, user_type: string }): Promise<{ data: any, message: string }> {
        try {
            const commonService = new CommonService(db.user);
            /**
             * Checking logged in as a user or not.
             */
            const user_id = await commonService.getUserGroupProviderId(user_data, db.User, db.UserProvider);
            user_data.id = user_id ?? user_data.id;

            /**
             * get providers details start
             */
            const provider_condition: sequelizeObj = {
                where: { [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: user_data.id, IsActive: 1 },
                attributes: ['ProviderDoctorID', 'FirstName', 'MiddleName', 'LastName']
            };
            const provider_data: Array<Record<string, any>> = await commonService.getAllList(provider_condition, db.ProviderDoctor);
            const provider_ids: Array<string> = provider_data.map(provider => provider.ProviderDoctorID);
            /**
             * get providers details end
             */

            /**
             * get payers details start
             */
            const grp_insurance_condition: sequelizeObj = {
                where: { ProviderDoctorID: { $in: _.uniq(provider_ids) }, IsActive: 1 },
                attributes: ['GroupInsuranceID']
            };
            const grp_insurance: Array<Record<string, any>> = await commonService.getAllList(grp_insurance_condition, db.InsuranceTransaction);
            const grp_insurance_ids: Array<string> = _.uniq(grp_insurance.map(insurance => insurance.GroupInsuranceID));

            const payer_condition: sequelizeObj = {
                where: { GroupInsuranceID: { $in: grp_insurance_ids }, IsActive: 1 },
                attributes: ['InsuranceID'],
                include: [
                    {
                        model: db.InsuranceMaster,
                        as: 'payer',
                        where: { IsActive: 1 },
                        attributes: ['Name']
                    }
                ]
            };
            const payer_data: Array<Record<string, any>> = await commonService.getAllList(payer_condition, db.GroupInsurance);
            /**
             * get payers details end
             */

            /**
             * get locations details start
             */
            const location_condition: sequelizeObj = {
                where: { ProviderDoctorID: { $in: provider_ids }, IsActive: 1 },
                attributes: ['LocationID'],
                include: [
                    {
                        model: db.Location,
                        as: 'location',
                        where: { IsActive: 1 },
                        attributes: ['Name']
                    }
                ]
            };
            const location_data: Array<Record<string, any>> = await commonService.getAllList(location_condition, db.DoctorLocation);
            const unique_locations = _.uniqBy(location_data, 'LocationID');
            /**
             * get locations details end
             */

            /**
             * combain the overall providers, payers, locations data's here
             */
            const finalResult: Record<string, any> = {
                providers: JSON.parse(JSON.stringify(provider_data)),
                payers: JSON.parse(JSON.stringify(payer_data)),
                location: JSON.parse(JSON.stringify(unique_locations))
            };

            if (finalResult && !_.isNil(finalResult) && !_.isEmpty(finalResult)) {
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.APP_FILTER) };
            } else {
                return { data: finalResult, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.APP_FILTER) };
            }

        } catch (error: any) {
            logger.error(error.message);
            throw new Error(error.message);
        }
    }

}