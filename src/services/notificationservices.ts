import _ from 'lodash';
import { sequelizeObj } from '../helpers/sequelizeobj';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
import DateConvertor from '../helpers/date';

const logger = require('../helpers/logger');
const { Op } = require('sequelize');
const appConstant = new AppConstants();

export default class NotificationService {

    async getCount(login_data: any, user_data: any, filter_data?: any) {

        try {

            logger.info(appConstant.COUNT_MESSAGE.COUNT_FUNCTION_STARTED);

            if (_.isNil(user_data.entity) || user_data.entity == "") {
                return { message: "Entity is required" }
            }
            const commonService = new CommonService(db.user);
            let entityCount: any;
            let entity

            const user_id = await commonService.getUserGroupProviderId(login_data, db.User, db.UserProvider);
            login_data.id = user_id ?? login_data.id;

            const appnotificationcondition: sequelizeObj = {}

            if (user_data.entity && user_data.entity == 'all') {
                entity = ['Esign', 'Provider Enrollment', 'Document']
            }
            else {
                entity = user_data.entity
            }

            appnotificationcondition.where = {
                [login_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: login_data.id,
                ...((user_data.entity && (user_data.entity == 'alert' || user_data.entity == 'all')) && { Entity: { $in: [entity] } }),
            }

            if (!user_data.entity && (user_data.entity != 'alert' || user_data.entity != 'all')) {
                appnotificationcondition.attributes = ['Entity']
            }

            let result: any;

            if (user_data.entity && (user_data.entity == 'alert' || user_data.entity == 'all')) {
                result = await commonService.getCount(appnotificationcondition, db.AppNotificationReceipts);
                entityCount = result
            }
            else if (user_data.entity && user_data.entity == 'detail_count') {
                result = await commonService.getAllList(appnotificationcondition, db.AppNotificationReceipts);
                entityCount = {}
                await result.forEach((item: any) => {
                    if (!_.isNil(item) && !_.isNil(item.Entity)) {
                        const entity: any = item.Entity;
                        entityCount[entity] = (entityCount[entity] || 0) + 1;
                    }
                });
            }

            const final_result: Array<Record<string, any>> = await entityCount;

            if (final_result && !_.isNil(final_result) && !_.isEmpty(final_result)) {
                logger.info(appConstant.COUNT_MESSAGE.COUNT_FUNCTION_COMPLETED)
                return { data: final_result, message: appConstant.COUNT_MESSAGE.COUNT_FUNCTION_COMPLETED }
            } else {
                logger.info(appConstant.COUNT_MESSAGE.COUNT_FUNCTION_FAILED)
                return { data: null, message: appConstant.COUNT_MESSAGE.COUNT_FUNCTION_FAILED }
            }

        } catch (error) {
            logger.info(appConstant.COUNT_MESSAGE.COUNT_FUNCTION_FAILED, error);
            throw error;
        }

    }

}