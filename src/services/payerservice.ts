import { Request, Response } from 'express';
import { sequelizeObj } from '../helpers/sequelizeobj';
import { encrypt, decrypt } from '../helpers/aes';
import * as db from '../adapters/db';
import _ from 'lodash';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');

const appConstant = new AppConstants();

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
                    attributes: ['TaskID', 'EffectiveDate', 'RecredentialingDate'],
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

            const finalResult: Array<Record<string, any>> = provider_list

            if (finalResult && !_.isNil(finalResult) && !_.isEmpty(finalResult)) {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.PAYER_MESSAGES.PATER) };
            } else {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.PAYER_MESSAGES.PATER) };
            }
        } catch (error: any) {
            logger.error(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

}
