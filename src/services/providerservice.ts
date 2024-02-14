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

    async getProviderData(user_data: { id: string, user_type: string }, filter_data?: any): Promise<any> {
        try {
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

            /**
             * get providers details start
             */
            const provider_condition: sequelizeObj = {};
            provider_condition.where = {
                [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: user_data.id,
                ...((!_.isNil(filter_datas) && !_.isEmpty(filter_datas.providers)) && { ProviderDoctorID: { $in: filter_datas.providers } }),
            };

            provider_condition.attributes = ['ProviderDoctorID', 'ProfileImage', 'FirstName', 'MiddleName', 'LastName', 'IsActive']

            provider_condition.include = [
                {
                    model: db.ProviderGroup,
                    as: 'provider_group_detail',
                    required: true,
                    attributes: ['ProviderGroupID', 'Name']
                },
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
                }
            ]

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext)) {
                const searchparams: Record<string, unknown> = {};

                searchparams.FirstName = { $like: '%' + filter_data.searchtext + '%' };
                searchparams.MiddleName = { $like: '%' + filter_data.searchtext + '%' };
                searchparams.LastName = { $like: '%' + filter_data.searchtext + '%' };
                // searchparams.IsActive = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$provider_group_detail.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$suffix_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$certification_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };

                provider_condition.where['$or'] = searchparams;
                provider_condition.where = _.omit(provider_condition.where, ['searchtext']);
            }

            const provider_data: Array<Record<string, any>> = await commonService.getAllList(provider_condition, db.ProviderDoctor);
            const provider_list = JSON.parse(JSON.stringify(provider_data));

            await provider_list.map((provider: any) => {
                if (!_.isNil(provider.ProfileImage)) {
                    const profileimage = btoa(provider.ProfileImage);
                    provider.ProfileImage = `data:image/png;base64, ${profileimage}`;
                } else {
                    provider.ProfileImage = null
                }
            })

            const finalResult: Array<Record<string, any>> = provider_list

            if (finalResult && !_.isNil(finalResult) && !_.isEmpty(finalResult)) {
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.PROVIDER_MESSAGES.PROVIDER) };
            } else {
                return { data: finalResult, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.PROVIDER_MESSAGES.PROVIDER) };
            }
        } catch (error: any) {
            logger.error(error.message);
            throw new Error(error.message)
        }
    }

}
