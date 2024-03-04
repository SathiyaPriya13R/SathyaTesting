import { Request, Response } from 'express';
import { sequelizeObj } from '../helpers/sequelizeobj';
import { encrypt, decrypt } from '../helpers/aes';
import * as db from '../adapters/db';
import _ from 'lodash';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
import DateConvertor from '../helpers/date';
import moment from 'moment-timezone';
const logger = require('../helpers/logger');

const appConstant = new AppConstants();
const dateConvert = new DateConvertor();

export default class ProviderService {

    async getPayerData(user_data: { id: string, user_type: string }, filter_data?: any): Promise<any> {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_STARTED);
            if ((filter_data.all == false) && (_.isNil(filter_data.provider_id) || filter_data.provider_id == '')) {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_FAILED);
                return { message: 'Please enter provder id' };
            }

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

            /**
             * get providers based payer details start
             */
            const provider_condition: sequelizeObj = {};
            provider_condition.where = {
                [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: user_data.id,
                ...((filter_data.all == true && !_.isNil(filter_datas) && !_.isEmpty(filter_datas.providers)) && { ProviderDoctorID: { $in: filter_datas.providers } }),
                ...((filter_data.all == false && !_.isNil(filter_data.provider_id) && !_.isEmpty(filter_data.provider_id)) && { ProviderDoctorID: { $eq: filter_data.provider_id } }),
            };

            provider_condition.attributes = ['ProviderDoctorID', 'FirstName', 'MiddleName', 'LastName']

            provider_condition.include = [
                {
                    model: db.lookupValue,
                    as: 'suffix_name',
                    required: true,
                    where: { IsActive: 1 },
                    attributes: ['Name']
                },
                {
                    model: db.lookupValue,
                    as: 'certification_name',
                    where: { IsActive: 1 },
                    attributes: ['Name']
                },
                {
                    model: db.InsuranceTransaction,
                    as: 'insurance_details',
                    where: { IsActive: 1 },
                    attributes: ['InsuranceTransactionID', 'TaskID', 'EffectiveDate', 'RecredentialingDate'],
                    include: [
                        {
                            model: db.GroupInsurance,
                            as: 'grp_insurance',
                            where: {
                                IsActive: 1,
                                ...((filter_data.all == true && !_.isNil(filter_datas) && !_.isEmpty(filter_datas.payers)) && { InsuranceID: { $in: filter_datas.payers } })
                            },
                            attributes: ['GroupInsuranceID'],
                            include: [
                                {
                                    model: db.InsuranceMaster,
                                    as: 'insurance_name',
                                    where: { IsActive: 1 },
                                    attributes: ['InsuranceID', 'Name']
                                }
                            ]
                        }
                    ]
                }
            ]

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                const searchparams: Record<string, unknown> = {};

                searchparams['$insurance_details.grp_insurance.insurance_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$insurance_details.TaskID$'] = { $like: '%' + filter_data.searchtext + '%' };

                provider_condition.where['$or'] = searchparams;
                provider_condition.where = _.omit(provider_condition.where, ['searchtext']);
            }

            const provider_data: Array<Record<string, any>> = await commonService.getAllList(provider_condition, db.ProviderDoctor);
            const provider_list = JSON.parse(JSON.stringify(provider_data));
            const provider_ids: Array<string> = provider_list.map((provider: any) => provider.ProviderDoctorID)

            const payer_array: Array<any> = await this.getAllPayers(provider_ids, filter_data, filter_datas)

            await provider_list.map((provider: any) => {
                delete provider.insurance_details
            })

            const final_data: Array<Record<string, any>> = []

            await provider_list.map((provider: any) => {
                payer_array.map((payer: any) => {
                    if (provider.ProviderDoctorID == payer.details_insurance.ProviderDoctorID) {
                        if (!provider.insurance_details) {
                            provider.insurance_details = [];
                        }
                        provider.insurance_details.push(payer);
                    }
                })
                if (!_.isNil(payer_array) && !_.isEmpty(payer_array)) {
                    final_data.push(provider)
                }
            })

            await provider_list.map((provider: any) => {
                if (!_.isNil(provider.insurance_details)) {
                    provider.insurance_details.map(async (insurance: any) => {
                        if (!_.isNil(insurance.EffectiveDate) && !_.isNil(insurance.RecredentialingDate)) {
                            const formattedEffectiveDate = await dateConvert.dateFormat(insurance.EffectiveDate)
                            const formattedRecredentialingDate = await dateConvert.dateFormat(insurance.RecredentialingDate)
                            insurance.EffectiveDate = formattedEffectiveDate
                            insurance.RecredentialingDate = formattedRecredentialingDate
                        }
                    })
                }
            })

            const finalResult: Array<Record<string, any>> = await final_data

            if (finalResult && !_.isNil(finalResult) && !_.isEmpty(finalResult)) {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.PAYER_MESSAGES.PATER) };
            } else {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_COMPLETED);
                return { data: null, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.PAYER_MESSAGES.PATER) };
            }

        } catch (error: any) {
            logger.error(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

    /**
     * For Payer history list
     */
    async getPayerHistoryData(filter_data: any): Promise<any> {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.PAYER_MESSAGES.PAYER_HISTORY_FUNCTION_STARTED);
            if (_.isNil(filter_data.transaction_id) || filter_data.transaction_id == '') {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_HISTORY_FUNCTION_FAILED);
                return { message: 'Please enter transaction id' };
            }

            const insurance_transaction_condition: sequelizeObj = {};

            insurance_transaction_condition.where = {
                InsuranceTransactionID: filter_data.transaction_id,
                IsActive: 1
            }
            insurance_transaction_condition.attributes = ['InsuranceTransactionID']

            insurance_transaction_condition.include = [
                {
                    model: db.ProviderDoctor,
                    as: 'provider_details',
                    where: { IsActive: 1 },
                    attributes: ['ProviderDoctorID', 'FirstName', 'MiddleName', 'LastName'],
                    include: [
                        {
                            model: db.lookupValue,
                            as: 'suffix_name',
                            required: true,
                            where: { IsActive: 1 },
                            attributes: ['Name']
                        },
                        {
                            model: db.lookupValue,
                            as: 'certification_name',
                            where: { IsActive: 1 },
                            attributes: ['Name']
                        },
                    ]
                },
                {
                    model: db.GroupInsurance,
                    as: 'grp_insurance',
                    where: {
                        IsActive: 1,
                    },
                    attributes: ['GroupInsuranceID'],
                    include: [
                        {
                            model: db.InsuranceMaster,
                            as: 'insurance_name',
                            where: { IsActive: 1 },
                            attributes: ['InsuranceID', 'Name']
                        }
                    ]
                },
                {
                    model: db.InsuranceFollowup,
                    as: 'history_details',
                    where: { IsActive: 1 },
                    attributes: ['ModifiedDate', 'NextFollowupDate', 'Remarks'],
                    include: [
                        {
                            model: db.lookupValue,
                            as: 'status_name',
                            where: { IsActive: 1 },
                            attributes: ['Name']
                        },
                        {
                            model: db.User,
                            as: 'followedby_user',
                            where: { IsActive: 1 },
                            attributes: ['DisplayName']
                        }
                    ]
                }
            ]

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                const searchparams: Record<string, unknown> = {};

                searchparams['$history_details.status_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$history_details.followedby_user.DisplayName$'] = { $like: '%' + filter_data.searchtext + '%' };

                if (filter_data.searchtext && !_.isNil(filter_data.searchtext) && Date.parse(filter_data.searchtext) != null && filter_data.searchtext.toString() != 'Invalid date' && !isNaN(Date.parse(filter_data.searchtext))) {
                    const start_date = moment(filter_data.searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 00:00:00.000')
                    const end_date = moment(filter_data.searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 23:59:59.999')
                    const date_range = [start_date, end_date]
                    searchparams['$history_details.ModifiedDate$'] = { $between: date_range };
                    searchparams['$history_details.NextFollowupDate$'] = { $between: date_range };
                }
                
                insurance_transaction_condition.where['$or'] = searchparams;
                insurance_transaction_condition.where = _.omit(insurance_transaction_condition.where, ['searchtext']);
            }

            const insurance_history_data = await commonService.getData(insurance_transaction_condition, db.InsuranceTransaction)
            const payer_data = JSON.parse(JSON.stringify(insurance_history_data));

            if (payer_data && !_.isNil(payer_data) && !_.isNil(payer_data.history_details) && payer_data.history_details.length > 0) {
                await payer_data.history_details.map(async (history: any) => {
                    const formattedModifiedDate = !_.isNil(history.ModifiedDate) ? await dateConvert.dateFormat(history.ModifiedDate) : null
                    const formattedNextFollowupDate = !_.isNil(history.NextFollowupDate) ? await dateConvert.dateFormat(history.NextFollowupDate) : null
                    history.NextFollowupDate = formattedNextFollowupDate
                    history.LastFollowedDate = formattedModifiedDate
                    delete history.ModifiedDate
                })
            }

            const finalResult: Array<Record<string, any>> = payer_data;

            if (finalResult && !_.isNil(finalResult) && !_.isEmpty(finalResult)) {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_HISTORY_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.PAYER_MESSAGES.PAYER_HISTORY) };
            } else {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_HISTORY_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.PAYER_MESSAGES.PAYER_HISTORY) };
            }

        } catch (error: any) {
            logger.error(appConstant.PAYER_MESSAGES.PAYER_HISTORY_FUNCTION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

    async getAllPayers(provider_ids: Array<any>, filter_data: any, filter_datas: any) {

        return new Promise((resolve: (value: Array<any>) => void, reject: (value: any) => void): void => {
            const commonService = new CommonService(db.user);
            try {
                const payer_datas: Array<any> = []
                const payer_condition: sequelizeObj = {}
                const idx: number = 0;
                grtPayers(idx);
                async function grtPayers(idx: number) {
                    const provider_id = provider_ids[idx];
                    if (idx != provider_ids.length) {
                        payer_condition.where = { IsActive: 1, ProviderDoctorID: { $eq: provider_id } }

                        payer_condition.attributes = ['InsuranceTransactionID', 'TaskID', 'EffectiveDate', 'RecredentialingDate']

                        payer_condition.include = [
                            {
                                model: db.ProviderDoctor,
                                as: 'details_insurance',
                                required: true,
                                attributes: ['ProviderDoctorID']
                            },
                            {
                                model: db.GroupInsurance,
                                as: 'grp_insurance',
                                where: {
                                    IsActive: 1,
                                    ...((filter_data.all == true && !_.isNil(filter_datas) && !_.isEmpty(filter_datas.payers)) && { InsuranceID: { $in: filter_datas.payers } })
                                },
                                attributes: ['GroupInsuranceID'],
                                include: [
                                    {
                                        model: db.InsuranceMaster,
                                        as: 'insurance_name',
                                        where: { IsActive: 1 },
                                        attributes: ['InsuranceID', 'Name']
                                    }
                                ]
                            },
                            {
                                model: db.Location,
                                as: 'insurance_location',
                                where: { IsActive: 1 },
                                attributes: ['AddressLine1', 'ZipCode']
                            },
                            {
                                model: db.InsuranceFollowup,
                                as: 'insurance_status',
                                where: { IsActive: 1, IsLast: 1 },
                                attributes: ['StatusID'],
                                include: [
                                    {
                                        model: db.lookupValue,
                                        as: 'status_name',
                                        where: { IsActive: 1 },
                                        attributes: ['Name']
                                    }
                                ]
                            }
                        ]

                        if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                            const searchparams: Record<string, unknown> = {};

                            searchparams['$grp_insurance.insurance_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                            searchparams.TaskID = { $like: '%' + filter_data.searchtext + '%' };

                            payer_condition.where['$or'] = searchparams;
                            payer_condition.where = _.omit(payer_condition.where, ['searchtext']);
                        }

                        payer_condition.limit = (filter_data.limit) ? +filter_data.limit : undefined
                        payer_condition.offset = (filter_data.offset) ? +filter_data.offset : undefined

                        const payer_data: Array<Record<string, any>> = await commonService.getAllList(payer_condition, db.InsuranceTransaction);
                        const payer_list = JSON.parse(JSON.stringify(payer_data));
                        payer_datas.push(payer_list)
                        idx++
                        grtPayers(idx)

                    } else {
                        const flatted_payers = payer_datas.flat();
                        resolve(flatted_payers)
                    }
                }
            } catch (e) {
                reject(e);
            }
        })

    }

}
