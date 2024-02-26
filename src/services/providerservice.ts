import { sequelizeObj } from '../helpers/sequelizeobj';
import { encrypt, decrypt } from '../helpers/aes';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
require('dotenv').config();
import _ from 'lodash';
import DateConvertor from '../helpers/date';
import { Sequelize } from 'sequelize';
const moment = require('moment-timezone');
const { Op } = require('sequelize');

const appConstant = new AppConstants();
const dateConvert = new DateConvertor();

export default class ProviderService {

    async getProviderData(user_data: { id: string, user_type: string }, filter_data?: any): Promise<any> {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.PROVIDER_MESSAGES.PROVIDER_FUNCTION_STARTED)
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
                // searchparams['$provider_group_detail.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$suffix_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$certification_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };

                provider_condition.where['$or'] = searchparams;
                provider_condition.where = _.omit(provider_condition.where, ['searchtext']);
            }

            provider_condition.limit = (filter_data.limit) ? +filter_data.limit : undefined
            provider_condition.offset = (filter_data.offset) ? +filter_data.offset : undefined

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
                logger.info(appConstant.PROVIDER_MESSAGES.PROVIDER_FUNCTION_COMPLETED)
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.PROVIDER_MESSAGES.PROVIDER) };
            } else {
                logger.info(appConstant.PROVIDER_MESSAGES.PROVIDER_FUNCTION_COMPLETED)
                return { data: null, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.PROVIDER_MESSAGES.PROVIDER) };
            }
        } catch (error: any) {
            logger.error(appConstant.PROVIDER_MESSAGES.PROVIDER_FUNCTION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

    /**
     * For provider speciality
     */
    async providerSpec(body: any) {
        try {
            const commonService = new CommonService(db.user);
            const providerspec_condition: sequelizeObj = {
                where: { ProviderDoctorID: body.id },
                include: [
                    {
                        model: db.Speciality,
                        as: 'ProviderSpec',
                        attributes: ['Name']
                    },
                    {
                        model: db.lookupValue,
                        as: 'BoardStatus',
                        attributes: ['Name']
                    }
                ],
                attributes: ['SpecialityID', 'IssueDate', 'ExpireDate', 'BoardStatusID', 'IsActive']
            };

            if (body.searchtext && body.searchtext != '' && !_.isNil(body.searchtext)) {
                const searchTextLike = `%${body.searchtext}%`;
                const convertedDate = moment(body.searchtext, 'DD MMM YYYY').format('YYYY-MM-DD'); // Convert to SQL-friendly format
                providerspec_condition.where = {
                    [Op.and]: [
                        { ProviderDoctorID: body.id },
                        {
                            [Op.or]: [
                                Sequelize.literal(`ProviderSpec.Name LIKE '${searchTextLike}'`),
                                Sequelize.literal(`BoardStatus.Name LIKE '${searchTextLike}'`)
                            ]
                        }
                    ],
                };
                if (!isNaN(new Date (convertedDate).getTime())) {
                        providerspec_condition.where = {
                    [Op.and]: Sequelize.literal(`CAST(IssueDate AS DATE) = '${convertedDate}'`),
                    [Op.and]: Sequelize.literal(`CAST(ExpireDate AS DATE) = '${convertedDate}'`)
                    }
                }
            }

            let providerSpecData: Array<Record<string, any>> = await commonService.getAllList(providerspec_condition, db.ProviderSpec);
            providerSpecData = JSON.parse(JSON.stringify(providerSpecData));
            let finalRes: any = [];
            const promises = providerSpecData.map(async (specdata: any) => {
                if (specdata.IssueDate) {
                    const updatedIssueDate = await dateConvert.dateFormat(specdata.IssueDate);
                    specdata.IssueDate = updatedIssueDate;
                }
                if (specdata.ExpireDate) {
                    const updatedExpireDate = await dateConvert.dateFormat(specdata.ExpireDate);
                    specdata.ExpireDate = updatedExpireDate;
                }
                if (specdata.IsActive) {
                    specdata.status = 'Active'
                } else {
                    specdata.status = 'Inactive'
                }
                finalRes.push(specdata);
            });
            await Promise.all(promises);
            return { data: encrypt(JSON.stringify(finalRes)) };
        } catch (error: any) {
            logger.error(appConstant.LOGGER_MESSAGE.PROVIDER_SPEC_FUNCTION_FAILED);
            throw new Error(error.message);
        }
    }

    /**
     * For View plans
     */
    async viewPlans(filter_data: any) {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.PROVIDER_MESSAGES.PROVIDER_VIEWPLAN_FUNCTION_STARTED);

            if (_.isNil(filter_data.provider_id) || filter_data.provider_id == '') {
                logger.info(appConstant.PROVIDER_MESSAGES.PROVIDER_VIEWPLAN_FUNCTION_FAILED);
                return { message: 'Please enter provider id' };
            }

            const provider_condition: sequelizeObj = {};

            provider_condition.where = {
                ProviderDoctorID: filter_data.provider_id,
            }

            provider_condition.attributes = ['ProviderDoctorID', 'FirstName', 'MiddleName', 'LastName']

            provider_condition.include = [
                {
                    model: db.InsuranceTransaction,
                    as: 'insurance_details',
                    where: { IsActive: 1 },
                    attributes: ['InsuranceTransactionID'],
                    include: [
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
                                    attributes: ['InsuranceID', 'Name'],
                                    include: [
                                        {
                                            model: db.lookupValue,
                                            as: 'insurance_location',
                                            attributes: ['Name']
                                        },
                                        {
                                            model: db.InsurancePlan,
                                            as: 'plan_details',
                                            where: { IsActive: 1 },
                                            attributes: ['InsurancePlanID', 'PlanName'],
                                            include: [
                                                {
                                                    model: db.EnrollmentPlans,
                                                    as: 'enrolled_plans',
                                                    where: { IsActive: 1 },
                                                    attributes: ['EffectiveOn', 'ExpiresOn'],
                                                    include: [
                                                        {
                                                            model: db.ProviderSpec,
                                                            as: 'provider_spec',
                                                            where: { IsActive: 1 },
                                                            attributes: ['ProviderDepartmentSpecialityID'],
                                                            include: [
                                                                {
                                                                    model: db.Speciality,
                                                                    as: 'ProviderSpec',
                                                                    attributes: ['Name']
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                const searchparams: Record<string, unknown> = {};

                searchparams['$insurance_details.grp_insurance.insurance_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$insurance_details.grp_insurance.insurance_name.insurance_location.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$insurance_details.grp_insurance.insurance_name.plan_details.PlanName$'] = { $like: '%' + filter_data.searchtext + '%' };

                provider_condition.where['$or'] = searchparams;
                provider_condition.where = _.omit(provider_condition.where, ['searchtext']);
            }

            const provider_plan_data = await commonService.getData(provider_condition, db.ProviderDoctor)
            const provider_data = JSON.parse(JSON.stringify(provider_plan_data));

            if (!_.isNil(provider_data)) {
                await provider_data.insurance_details.map(async (insurance: any) => {
                    if (insurance) {
                        await insurance.grp_insurance.insurance_name.plan_details.map(async (plans: any) => {
                            if (plans) {
                                await plans.enrolled_plans.map(async (enrolled_plan: any) => {
                                    if (!_.isNil(enrolled_plan.EffectiveOn) || !_.isNil(enrolled_plan.ExpiresOn)) {
                                        const formattedEffectiveOn = !_.isNil(enrolled_plan.EffectiveOn) ? await dateConvert.dateFormat(enrolled_plan.EffectiveOn) : null
                                        const formattedExpiresOn = !_.isNil(enrolled_plan.ExpiresOn) ? await dateConvert.dateFormat(enrolled_plan.ExpiresOn) : null
                                        enrolled_plan.EffectiveOn = formattedEffectiveOn
                                        enrolled_plan.ExpiresOn = formattedExpiresOn
                                    }
                                })
                            }
                        })
                    }
                })
            }

            const finalResult: Array<Record<string, any>> = provider_data;

            if (finalResult && !_.isNil(finalResult) && !_.isEmpty(finalResult)) {
                logger.info(appConstant.PROVIDER_MESSAGES.PROVIDER_VIEWPLAN_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.PROVIDER_MESSAGES.PROVIDER_VIEWPLAN) };
            } else {
                logger.info(appConstant.PROVIDER_MESSAGES.PROVIDER_VIEWPLAN_FUNCTION_COMPLETED);
                return { data: finalResult, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.PROVIDER_MESSAGES.PROVIDER_VIEWPLAN) };
            }

        } catch (error: any) {
            logger.error(appConstant.PROVIDER_MESSAGES.PROVIDER_VIEWPLAN_FUNCTION_FAILED);
            throw new Error(error.message);
        }
    }
}
