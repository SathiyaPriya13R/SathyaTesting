import { Request, Response } from 'express';
import { sequelizeObj } from '../helpers/sequelizeobj';
import { encrypt, decrypt } from '../helpers/aes';
import * as db from '../adapters/db';
import _ from 'lodash';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');

const appConstant = new AppConstants();

export default class LocationService {

    async getLocationData(user_data: { id: string, user_type: string }, filter_data?: any): Promise<any> {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_STARTED);
            if ((filter_data.all == false) && (_.isNil(filter_data.provider_id) || filter_data.provider_id == '')) {
                logger.info(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_FAILED);
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
            const location_status = !_.isNil(filter_data.status_filter) ? filter_data.status_filter : true;
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
                    model: db.DoctorLocation,
                    as: 'provider_location',
                    where: {
                        IsActive: location_status,
                        ...((filter_data.all == true && !_.isNil(filter_datas) && !_.isEmpty(filter_datas.locations)) && { LocationID: { $in: filter_datas.locations } })
                    },
                    attributes: ['IsActive'],
                    include: [
                        {
                            model: db.Location,
                            as: 'location_details',
                            attributes: ['Name', 'AddressLine1', 'AddressLine2', 'ZipCode', 'City'],
                            include: [
                                {
                                    model: db.lookupValue,
                                    as: 'state_name',
                                    attributes: ['Name']
                                }
                            ]
                        }
                    ]
                }
            ]

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                const searchparams: Record<string, unknown> = {};

                searchparams['$provider_location.location_details.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$provider_location.location_details.City$'] = { $like: '%' + filter_data.searchtext + '%' };

                provider_condition.where['$or'] = searchparams;
                provider_condition.where = _.omit(provider_condition.where, ['searchtext']);
            }

            const provider_data: Array<Record<string, any>> = await commonService.getAllList(provider_condition, db.ProviderDoctor);
            const provider_list = JSON.parse(JSON.stringify(provider_data));

            const finalResult: Array<Record<string, any>> = provider_list

            if (finalResult && !_.isNil(finalResult) && !_.isEmpty(finalResult)) {
                logger.info(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.LOCATION_MESSAGES.LOCATION) };
            } else {
                logger.info(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.LOCATION_MESSAGES.LOCATION) };
            }
        } catch (error: any) {
            logger.error(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

}
