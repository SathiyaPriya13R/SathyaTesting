import * as db from '../adapters/db';
import sequelize = require('sequelize');
import { sequelizeObj } from '../helpers/sequelizeobj';
import CommonService from '../helpers/commonService';
import AppConstants from "../utils/constants";
import { queries } from '../utils/queries';
import _ from 'lodash';
const logger = require('../helpers/logger');

const appConstant = new AppConstants();

export default class DashboardService {
    async getStatisticsCount(data: { user_id: string, user_type: string, statistics_type: string, providers: Array<string>, payers: Array<string>, locations: Array<string> }): Promise<void> {
        try {

            const commonService = new CommonService(db.user)
            const queryparams = {} as sequelizeObj;
            const querystring = (data.statistics_type == appConstant.STATISTICS_TYPE[0]) ? queries.month_wise_statistics_count : queries.week_wise_statistics_count;

            const user_object = await commonService.getData({ where: { Id: data.user_id }, attributes: ['Id', 'ProviderGroupID'] }, db.User);
            const user_obj = JSON.parse(JSON.stringify(user_object));

            if (!_.isNil(user_obj) && (data.user_type === appConstant.USER_TYPE[0])) {
                data.user_id = !_.isNil(user_obj.ProviderGroupID) ? user_obj.ProviderGroupID : null;
            }

            if (!_.isNil(user_obj) && (data.user_type === appConstant.USER_TYPE[1])) {
                const usr_pvdrgrp_data = await commonService.getData({ where: { UserID: user_obj.Id }, attributes: ['ProviderDoctorID'] }, db.UserProvider);
                const provider_id: { ProviderDoctorID: string } = !_.isNil(usr_pvdrgrp_data) ? JSON.parse(JSON.stringify(usr_pvdrgrp_data)) : null
                data.user_id = provider_id.ProviderDoctorID
            }

            if (data.user_type === appConstant.USER_TYPE[1]) {
                data.providers.push(data.user_id);
            }

            queryparams.type = sequelize.QueryTypes.SELECT;
            queryparams.replacements = {
                user_id: data.user_id,
                user_type: data.user_type,
                providers: data.providers,
                payers: data.payers,
                locations: data.locations
            };

            const statistics = await commonService.executeQuery(querystring, queryparams);
            const statistic_count = JSON.parse(JSON.stringify(statistics));

            return statistic_count;

        } catch (error: any) {
            logger.error(error);
            throw new Error(error.message);
        }
    }
}