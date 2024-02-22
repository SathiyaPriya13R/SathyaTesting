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
                    required: true,
                    attributes: ['IsActive', 'DoctorLocationID'],
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
                        },
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
            const provider_ids: Array<string> = provider_list.map((provider: any) => provider.ProviderDoctorID)

            const location_array: Array<any> = await this.getAllLocations(provider_ids, location_status, filter_data, filter_datas)

            await provider_list.map((provider: any) => {
                delete provider.provider_location
            })

            const final_data: Array<Record<string, any>> = []

            await provider_list.map((provider: any) => {
                location_array.map((location: any) => {
                    if (provider.ProviderDoctorID == location.location_provider.ProviderDoctorID) {
                        if (!provider.provider_location) {
                            provider.provider_location = [];
                        }
                        provider.provider_location.push(location);
                    }
                })
                if (!_.isNil(location_array) && !_.isEmpty(location_array)) {
                    final_data.push(provider)
                }
            })

            const finalResult: Array<Record<string, any>> = await final_data

            if (finalResult && !_.isNil(finalResult) && !_.isEmpty(finalResult)) {
                logger.info(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.LOCATION_MESSAGES.LOCATION) };
            } else {
                logger.info(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_COMPLETED);
                return { data: null, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.LOCATION_MESSAGES.LOCATION) };
            }

        } catch (error: any) {
            logger.error(appConstant.LOCATION_MESSAGES.LOCATION_FUNCTION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

    async getAllLocations(provider_ids: Array<any>, location_status: boolean, filter_data: any, filter_datas: any) {

        return new Promise((resolve: (value: Array<any>) => void, reject: (value: any) => void): void => {
            const commonService = new CommonService(db.user);
            try {
                const location_datas: Array<any> = []
                const location_condition: sequelizeObj = {}
                const idx: number = 0;
                getLocation(idx);
                async function getLocation(idx: number) {
                    const provider_id = provider_ids[idx];
                    if (idx != provider_ids.length) {

                        location_condition.where = {
                            IsActive: location_status,
                            ...((filter_data.all == true && !_.isNil(filter_datas) && !_.isEmpty(filter_datas.locations)) && { LocationID: { $in: filter_datas.locations } }),
                            ProviderDoctorID: { $eq: provider_id }
                        }

                        location_condition.attributes = ['IsActive', 'DoctorLocationID']

                        location_condition.include = [
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
                            },
                            {
                                model: db.ProviderDoctor,
                                as: 'location_provider',
                                required: true,
                                attributes: ['ProviderDoctorID']
                            }
                        ]

                        if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                            const searchparams: Record<string, unknown> = {};

                            searchparams['$location_details.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                            searchparams['$location_details.City$'] = { $like: '%' + filter_data.searchtext + '%' };

                            location_condition.where['$or'] = searchparams;
                            location_condition.where = _.omit(location_condition.where, ['searchtext']);
                        }

                        location_condition.limit = (filter_data.limit) ? +filter_data.limit : undefined
                        location_condition.offset = (filter_data.offset) ? +filter_data.offset : undefined

                        const location_data: Array<Record<string, any>> = await commonService.getAllList(location_condition, db.DoctorLocation);
                        const location_list = JSON.parse(JSON.stringify(location_data));
                        location_datas.push(location_list)
                        idx++
                        getLocation(idx)

                    } else {
                        const flatted_locations = location_datas.flat();
                        resolve(flatted_locations)
                    }
                }
            } catch (e) {
                reject(e);
            }
        })

    }

    async updateLocationStatus(update_data: { doctor_location_id: string, location_status: boolean }) {
        try {

            const commonService = new CommonService(db.user);
            logger.info(appConstant.LOCATION_MESSAGES.LOCATION_STATUS_UPDATE_STARTED);

            if ((_.isNil(update_data.doctor_location_id) || update_data.doctor_location_id == '') || (_.isNil(update_data.location_status) || typeof (update_data.location_status) != 'boolean')) {
                logger.info(appConstant.LOCATION_MESSAGES.LOCATION_STATUS_UPDATE_FAILED);
                return { message: 'Please enter valid location id or location status' };
            }

            let updated_data = await commonService.update({ DoctorLocationID: update_data.doctor_location_id }, { IsActive: update_data.location_status }, db.DoctorLocation)
            updated_data = JSON.parse(JSON.stringify(updated_data))

            if (update_data && !_.isNil(update_data) && !_.isEmpty(update_data)) {
                logger.info(appConstant.LOCATION_MESSAGES.LOCATION_STATUS_UPDATE_COMPLETED);
                return { data: updated_data, message: appConstant.LOCATION_MESSAGES.LOCATION_STATUS_UPDATE_SUCCEFULLY };
            } else {
                logger.info(appConstant.LOCATION_MESSAGES.LOCATION_STATUS_UPDATE_COMPLETED);
                return { data: null, message: appConstant.LOCATION_MESSAGES.LOCATION_STATUS_UPDATE_FAILED };
            }

        } catch (error: any) {
            logger.error(appConstant.LOCATION_MESSAGES.LOCATION_STATUS_UPDATE_FAILED, error.message);
            throw new Error(error.message)
        }
    }

}
