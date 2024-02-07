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
    async getStatisticsCount(user_data: { id: string, user_type: string }, data: { statistics_type: string, year_month: string, week_number: number, filter?: any }): Promise<any> {
        try {
            const commonService = new CommonService(db.user)
            const queryparams = {} as sequelizeObj;
            let providersquery = '';
            let payersquery = '';
            let locationsquery = '';

            let querystring = (data.statistics_type == appConstant.STATISTICS_TYPE[0]) ? queries.month_wise_statistics_count : queries.week_wise_statistics_count;

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

            const filter_datas: { providers: Array<string>, payers: Array<string>, locations: Array<string> } = (!_.isNil(data) && !_.isNil(data.filter) && (!_.isEmpty(data.filter.providers) || !_.isEmpty(data.filter.payers) || !_.isEmpty(data.filter.locations)))
                ? await commonService.getFilterDataIds(data.filter.providers, data.filter.payers, data.filter.locations, {
                    provider_doctor: db.ProviderDoctor,
                    insurance_transaction: db.InsuranceTransaction,
                    group_insurance: db.GroupInsurance,
                    doctor_location: db.DoctorLocation,
                })
                : { providers: [], payers: [], locations: [] };

            queryparams.type = sequelize.QueryTypes.SELECT;
            queryparams.replacements = {
                user_id: user_data.id,
                user_type: user_data.user_type,
                month: data.year_month,
            };

            if (!_.isNil(data.filter)) {
                if (!_.isEmpty(filter_datas.providers)) {
                    providersquery = ` AND insurance_transaction.ProviderDoctorID IN (${filter_datas.providers.map((pro: string) => `'${pro}'`).join(', ')})`;
                }

                if (!_.isEmpty(filter_datas.payers)) {
                    payersquery = ` AND insurance_master.InsuranceID IN (${filter_datas.payers.map((pay: string) => `'${pay}'`).join(', ')})`;
                }

                if (!_.isEmpty(filter_datas.locations)) {
                    locationsquery = ` AND insurance_transaction.LocationID IN (${filter_datas.locations.map((loc: string) => `'${loc}'`).join(', ')})`;
                }
            }

            querystring = querystring.replace(new RegExp(':providersquery:', 'g'), providersquery);
            querystring = querystring.replace(new RegExp(':payersquery:', 'g'), payersquery);
            querystring = querystring.replace(new RegExp(':locationsquery:', 'g'), locationsquery);

            const status_data_condition = {
                where: { Name: 'InsuranceFollowup Status', IsActive: 1 },
                attributes: ['LookupTypeID'],
                include: [
                    {
                        model: db.lookupValue,
                        as: 'followupstatus',
                        where: { IsActive: 1 },
                        attributes: ['LookupValueID', 'Name']
                    }
                ]
            }
            const status_data = await commonService.getData(status_data_condition, db.LookupType);
            const statuses = JSON.parse(JSON.stringify(status_data))

            const statistics = await commonService.executeQuery(querystring, queryparams);
            const statistic_count = JSON.parse(JSON.stringify(statistics));

            let weeklyData: any = {};
            if (data.statistics_type == appConstant.STATISTICS_TYPE[1] && !_.isNil(statuses) && !_.isNil(statistic_count)) {
                // Iterate through statistic count to organize data by week number
                statistic_count.forEach((stat: any) => {
                    const { week_number } = stat;
                    if (!weeklyData[week_number]) {
                        weeklyData[week_number] = [];
                    }
                    weeklyData[week_number].push(stat);
                });

                // Iterate through each week to add missing statuses with count 0
                Object.keys(weeklyData).forEach(week => {
                    const weekData = weeklyData[week];
                    const existingStatuses = weekData.map((item: any) => item.status);

                    statuses.followupstatus.forEach((status: any) => {
                        if (!existingStatuses.includes(status.Name)) {
                            weekData.push({
                                year: weekData[0].year,
                                month: weekData[0].month,
                                week_number: parseInt(week),
                                status: status.Name,
                                LookupValueID: status.LookupValueID,
                                status_count: 0
                            });
                        }
                    });

                    // Sort the data by status
                    weekData.sort((a: any, b: any) => {
                        if (a.status < b.status) return -1;
                        if (a.status > b.status) return 1;
                        return 0;
                    });
                });
            }

            let monthlyData: any = [];
            if (data.statistics_type == appConstant.STATISTICS_TYPE[0] && !_.isNil(statuses) && !_.isNil(statistic_count)) {
                statuses.followupstatus.forEach((statusItem: any) => {
                    // Check if there is a matching status in month_array
                    const matchingStatus = statistic_count.find((monthItem: any) => monthItem.LookupValueID === statusItem.LookupValueID);

                    // If a matching status is found in month_array, use its count
                    if (matchingStatus) {
                        monthlyData.push({
                            year: matchingStatus.year,
                            month: matchingStatus.month,
                            status: statusItem.Name,
                            LookupValueID: statusItem.LookupValueID,
                            status_count: matchingStatus.status_count
                        });
                    } else {
                        // If no matching status is found, set the count value to 0
                        monthlyData.push({
                            status: statusItem.Name,
                            LookupValueID: statusItem.LookupValueID,
                            status_count: 0
                        });
                    }
                });
            }

            let final_data: any;
            if (data.statistics_type == appConstant.STATISTICS_TYPE[1]) {
                final_data = (!_.isNil(weeklyData)) ? weeklyData : null
            }
            if (data.statistics_type == appConstant.STATISTICS_TYPE[0]) {
                final_data = (!_.isNil(monthlyData)) ? monthlyData : null
            }

            if (final_data && !_.isNil(final_data) && !_.isEmpty(final_data)) {
                return { data: final_data, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.DASHBOARD_STATISTICS) };
            } else {
                return { data: final_data, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.DASHBOARD_STATISTICS) };
            }

        } catch (error: any) {
            logger.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * For get the count of provider, location, payer
     */
    async getDashBoardSummary(user_data: { id: string, user_type: string }, filter_data?: any) {
        try {
            logger.info(appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_STARTED);
            const commonService = new CommonService(db.user);
            /**
             * Checking logged in as a user or not.
             */
            const user_id = await commonService.getUserGroupProviderId(user_data, db.User, db.UserProvider);
            user_data.id = user_id ?? user_data.id;

            const filter_datas: { providers: Array<string>, payers: Array<string>, locations: Array<string> } = (!_.isNil(filter_data) && !_.isNil(filter_data.filter) && (!_.isEmpty(filter_data.filter.providers) || !_.isEmpty(filter_data.filter.payers) || !_.isEmpty(filter_data.filter.locations)))
                ? await commonService.getFilterDataIds(filter_data.filter.providers, filter_data.filter.payers, filter_data.filter.locations, {
                    provider_doctor: db.ProviderDoctor,
                    insurance_transaction: db.InsuranceTransaction,
                    group_insurance: db.GroupInsurance,
                    doctor_location: db.DoctorLocation,
                })
                : { providers: [], payers: [], locations: [] };

            // For provider
            const provider_condition: sequelizeObj = {
                where: {
                    [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: user_data.id,
                    IsActive: 1,
                    ...((!_.isNil(filter_datas) && !_.isEmpty(filter_datas.providers)) && { ProviderDoctorID: { $in: filter_datas.providers } })
                },
                attributes: ['ProviderDoctorID']
            };
            const provider_data: Array<Record<string, any>> = await commonService.getAllList(provider_condition, db.ProviderDoctor);
            const unique_providers_data: Array<string> = _.uniq(provider_data.map(provider_data => provider_data.ProviderDoctorID));

            // For payers
            const grp_insurance_condition: sequelizeObj = {
                where: { ProviderDoctorID: { $in: _.uniq(unique_providers_data) }, IsActive: 1 },
                attributes: ['GroupInsuranceID']
            };
            const grp_insurance: Array<Record<string, any>> = await commonService.getAllList(grp_insurance_condition, db.InsuranceTransaction);
            const grp_insurance_ids: Array<string> = _.uniq(grp_insurance.map(insurance => insurance.GroupInsuranceID));

            const payer_condition: sequelizeObj = {
                where: {
                    GroupInsuranceID: { $in: grp_insurance_ids },
                    IsActive: 1,
                    ...((!_.isNil(filter_datas) && !_.isEmpty(filter_datas.payers)) && { InsuranceID: { $in: filter_datas.payers } })
                },
                attributes: ['InsuranceID']
            };
            const payer_data: Array<Record<string, any>> = await commonService.getAllList(payer_condition, db.GroupInsurance);
            const unique_payers_data: Array<string> = _.uniq(payer_data.map(payer_data => payer_data.InsuranceID));

            // For locations
            const location_condition: sequelizeObj = {
                where: {
                    ProviderDoctorID: { $in: _.uniq(unique_providers_data) },
                    IsActive: 1,
                    ...((!_.isNil(filter_datas) && !_.isEmpty(filter_datas.locations)) && { LocationID: { $in: filter_datas.locations } })
                },
                attributes: ['LocationID'],
            };
            const location_data: Array<Record<string, any>> = await commonService.getAllList(location_condition, db.DoctorLocation);
            const unique_locations_data: Array<string> = _.uniq(location_data.map(location_data => location_data.LocationID));

            const finalRes = {
                provider: unique_providers_data.length,
                payer: unique_payers_data.length,
                location: unique_locations_data.length
            }
            logger.info(appConstant.LOGGER_MESSAGE.DASHBOARD_SUMMARY_COMPLETED);
            return { data: encrypt(JSON.stringify(finalRes)) };

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