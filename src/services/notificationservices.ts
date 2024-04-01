import _ from 'lodash';
import { sequelizeObj } from '../helpers/sequelizeobj';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import DateConvertor from '../helpers/date';
import { Sequelize } from 'sequelize';
import sequelize from 'sequelize/types/sequelize';

const logger = require('../helpers/logger');
const { Op } = require('sequelize');
const IORedis = require('ioredis');

const appConstant = new AppConstants();
const dateConvertor = new DateConvertor()

const redisClient = new IORedis({
    host: process.env.REDIS_SERVER_IP,
    port: process.env.REDIS_SERVER_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_SERVER_DEFAULT_DB,
});

export default class NotificationService {

    async getCount(user_data: any, filter_data: any) {

        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.COUNT_MESSAGE.COUNT_FUNCTION_STARTED);

            if (_.isNil(filter_data.notification_type) || filter_data.notification_type == "") {
                return { message: "Notification type is required" }
            }

            let entityCount: any;
            let NotificationType: any = 'Alert';

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

            if (filter_data.notification_type == 'alert') {
                NotificationType = 'Alert'
            }

            if (filter_data.notification_type == 'notification') {
                NotificationType = 'Notification'
            }

            const appnotificationcondition: sequelizeObj = {}

            appnotificationcondition.where = {
                [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: user_data.id,
                ...((!_.isNil(filter_datas) && !_.isEmpty(filter_datas.providers)) && { ProviderDoctorID: { $in: filter_datas.providers } }),
                IsNotificationfRead: false,
                NotificationType: NotificationType,
            }

            if (filter_data.detail_count && filter_data.detail_count == true && filter_data.notification_type == 'notification') {
                appnotificationcondition.attributes = ['Entity']
            }
            appnotificationcondition.include = [
                {
                    model: db.ProviderDoctor,
                    as: 'provider',
                    required: true,
                    attributes: ['ProviderDoctorID', 'FirstName', 'MiddleName', 'LastName']
                }
            ]


            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                const searchparams: Record<string, unknown> = {};
                const searchtext = _.trim(filter_data.searchtext);
                searchparams.NotificationContent = { $like: '%' + searchtext + '%' };
                searchparams['$provider.FirstName$'] = { $like: '%' + searchtext + '%' };
                searchparams['$provider.MiddleName$'] = { $like: '%' + searchtext + '%' };
                searchparams['$provider.LastName$'] = { $like: '%' + searchtext + '%' };

                if (searchtext && !_.isNil(searchtext) && Date.parse(searchtext) != null && searchtext.toString() != 'Invalid date' && !isNaN(Date.parse(searchtext))) {
                    const start_date = moment(searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 00:00:00.000')
                    const end_date = moment(searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 23:59:59.999')
                    const date_range = [start_date, end_date]
                    searchparams.NotificationDate = { $between: date_range };
                }

                appnotificationcondition.where['$or'] = searchparams;
                appnotificationcondition.where = _.omit(appnotificationcondition.where, ['searchtext']);
            }

            let result: any;

            if (filter_data.detail_count == false && filter_data.notification_type && (filter_data.notification_type == 'alert' || filter_data.notification_type == 'notification')) {
                result = await commonService.getCount(appnotificationcondition, db.AppNotificationReceipts);
                entityCount = result
            }

            if (filter_data.detail_count && filter_data.detail_count == true && filter_data.notification_type == 'notification') {
                result = await commonService.getAllList(appnotificationcondition, db.AppNotificationReceipts);
                entityCount = {}
                await JSON.parse(JSON.stringify(result)).forEach((item: any) => {
                    if (!_.isNil(item) && !_.isNil(item.Entity)) {
                        let entity: any;
                        if (item.Entity == 'Payer Enrollment') {
                            entity = 'payer_enrollment';
                        }
                        if (item.Entity == 'Esign') {
                            entity = 'esign';
                        }
                        if (item.Entity == 'Document') {
                            entity = 'document';
                        }
                        entityCount[entity] = (entityCount[entity] || 0) + 1;
                    }
                });
            }

            const final_result: any = await entityCount;

            if (final_result && !_.isNil(final_result)) {
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

    async getNotificationList(user_data: { id: string, user_type: string }, filter_data: any) {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_LIST_FUNCTION_STARTED);

            if ((!filter_data.notification_for) && (_.isNil(filter_data.notification_for) || filter_data.notification_for == '')) {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_LIST_FUNCTION_FAILED);
                return { message: 'Please provide notification for' };
            }

            if ((!filter_data.entity_type) && (_.isNil(filter_data.entity_type) || filter_data.entity_type == '')) {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_LIST_FUNCTION_FAILED);
                return { message: 'Please provide notification entity type' };
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

            const notification_condition: sequelizeObj = {};

            let ntffor: string = ''
            if (filter_data.notification_for && filter_data.notification_for == 'alert') {
                ntffor = 'Alert'
            }
            else if (filter_data.notification_for && filter_data.notification_for == 'notification') {
                ntffor = 'Notification'
            }
            else if (filter_data.notification_for && filter_data.notification_for == 'mymessage') {
                ntffor = 'Notification'
            }

            let entity_type: Array<string> = []
            if ((filter_data.entity_type && filter_data.entity_type == 'all') || filter_data.notification_for == 'alert') {
                entity_type = ['Esign', 'Payer Enrollment', 'Document']
            }
            else if (filter_data.entity_type && filter_data.entity_type == 'esign') {
                entity_type = ['Esign']
            }
            else if (filter_data.entity_type && filter_data.entity_type == 'enrollment') {
                entity_type = ['Payer Enrollment']
            }
            else if (filter_data.entity_type && filter_data.entity_type == 'document') {
                entity_type = ['Document']
            }

            let message_filter: Array<boolean> = []
            if (filter_data.notification_for && (filter_data.notification_for == 'mymessage' || filter_data.notification_for == 'alert' || filter_data.notification_for == 'notification')) {
                message_filter = (filter_data.message_filter) ? filter_data.message_filter : [];
            }

            notification_condition.where = {
                NotificationType: ntffor,
                [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: user_data.id,
                ...((!_.isNil(filter_datas) && !_.isEmpty(filter_datas.providers)) && { ProviderDoctorID: { $in: filter_datas.providers } }),
                ...((!_.isNil(filter_data.notification_for) && filter_data.notification_for == 'alert' || filter_data.notification_for == 'notification') && { IsNotificationfRead: false }),
                ...((!_.isNil(message_filter) && !_.isEmpty(message_filter)) && { IsNotificationfRead: { $in: message_filter } }),
                ...((!_.isNil(entity_type) || !_.isEmpty(entity_type)) && { Entity: entity_type })
            }

            notification_condition.include = [
                {
                    model: db.ProviderDoctor,
                    as: 'provider',
                    required: true,
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
                        }
                    ]
                }
            ]

            notification_condition.attributes = ['AppNotificationID', 'NotificationDate', 'NotificationContent', 'IsNotificationfRead', 'ItemID', 'AttachmentID']

            notification_condition.order = [['NotificationDate', 'DESC']]

            notification_condition.limit = (filter_data.limit) ? +filter_data.limit : undefined
            notification_condition.offset = (filter_data.offset) ? +filter_data.offset : undefined

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                const searchparams: Record<string, unknown> = {};
                const searchtext = _.trim(filter_data.searchtext);
                searchparams.NotificationContent = { $like: '%' + searchtext + '%' };
                searchparams['$provider.FirstName$'] = { $like: '%' + searchtext + '%' };
                searchparams['$provider.MiddleName$'] = { $like: '%' + searchtext + '%' };
                searchparams['$provider.LastName$'] = { $like: '%' + searchtext + '%' };

                if (searchtext && !_.isNil(searchtext) && Date.parse(searchtext) != null && searchtext.toString() != 'Invalid date' && !isNaN(Date.parse(searchtext))) {
                    const start_date = moment(searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 00:00:00.000')
                    const end_date = moment(searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 23:59:59.999')
                    const date_range = [start_date, end_date]
                    searchparams.NotificationDate = { $between: date_range };
                }

                notification_condition.where['$or'] = searchparams;
                notification_condition.where = _.omit(notification_condition.where, ['searchtext']);
            }

            const notification_data = await commonService.getAllList(notification_condition, db.AppNotificationReceipts)
            const notifi_data = JSON.parse(JSON.stringify(notification_data))

            if (notifi_data && !_.isNil(notifi_data)) {
                await notifi_data.forEach(async (ntf: any) => {
                    const formattedNotificationDate = !_.isNil(ntf.NotificationDate) ? moment(ntf.NotificationDate).format('DD MMM YYYY') : null
                    ntf.NotificationDate = formattedNotificationDate
                    let prefix: any;
                    if (ntf.provider.certification_name && ntf.provider.certification_name.Name === 'MD') {
                        prefix = 'Dr';
                    } else {
                        prefix = '';
                    }
                    ntf.providerName = `${prefix} ${ntf.provider.FirstName} ${ntf.provider.LastName} ${ntf.provider.certification_name ? ntf.provider.certification_name.Name : ''}`;
                })
            }

            const final_result = notifi_data;

            if (final_result && !_.isNil(final_result) && !_.isEmpty(final_result)) {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_LIST_FUNCTION_COMPLETED);
                return { data: final_result, message: 'Notification list data found' }
            } else {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_LIST_FUNCTION_COMPLETED);
                return { data: null, message: 'Notification list data not found' }
            }

        } catch (error: any) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_LIST_FUNCTION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

    async getNotificationByid(notification_id: string) {

        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_BYID_FUNCTION_STARTED);

            if (!await commonService.checkUUID(notification_id)) {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_BYID_FUNCTION_FAILED);
                return { message: 'Please provide valid notification id' };
            }

            const notification_condition: sequelizeObj = {};

            notification_condition.where = {
                AppNotificationID: notification_id
            }

            notification_condition.include = [
                {
                    model: db.ProviderDoctor,
                    as: 'provider',
                    required: true,
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
                }
            ]

            notification_condition.attributes = ['AppNotificationID', 'NotificationDate', 'NotificationContent', 'IsNotificationfRead', 'Entity', 'NotificationDetailedContent']

            const notification_data = await commonService.getData(notification_condition, db.AppNotificationReceipts)
            const notifi_data = JSON.parse(JSON.stringify(notification_data))

            notifi_data.NotificationDate = !_.isNil(notifi_data.NotificationDate) ? moment(notifi_data.NotificationDate).format('DD MMM YYYY') : null

            const final_result = notifi_data;

            if (final_result && !_.isNil(final_result) && !_.isEmpty(final_result)) {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_BYID_FUNCTION_COMPLETED);
                return { data: final_result, message: 'Notification data found' }
            } else {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_BYID_FUNCTION_COMPLETED);
                return { data: null, message: 'Notification data not found' }
            }

        } catch (err: any) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_BYID_FUNCTION_FAILED, err.message);
            throw new Error(err.message)
        }
    }

    async updateNotificationStatus(update_data: { Notification_id: string, is_Read: boolean }) {

        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_STATUS_UPDATE_STARTED);

            if ((_.isNil(update_data.Notification_id) || update_data.Notification_id == '') || (_.isNil(update_data.is_Read) || typeof (update_data.is_Read) != 'boolean')) {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_STATUS_UPDATE_FAILED);
                return { message: 'Please enter valid notification id or notification status' };
            }

            let updated_data = await commonService.update({ AppNotificationID: update_data.Notification_id }, { IsNotificationfRead: update_data.is_Read }, db.AppNotificationReceipts)
            updated_data = JSON.parse(JSON.stringify(updated_data))


            if (update_data && !_.isNil(update_data) && !_.isEmpty(update_data)) {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_STATUS_UPDATE_COMPLETED);
                return { data: updated_data, message: appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_STATUS_UPDATE_SUCCEFULLY };
            } else {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_STATUS_UPDATE_COMPLETED);
                return { data: null, message: appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_STATUS_UPDATE_FAILED };
            }

        } catch (error: any) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_STATUS_UPDATE_FAILED, error.message);
            throw new Error(error.message)
        }
    }

    /**
     * This function used to push notification againts documents exprires in 30 days.
     */
    async pushDocumentNotification() {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_STARTED);

            const current_date = new Date();
            const expiry_threshold = new Date(current_date);
            expiry_threshold.setDate(current_date.getDate() + 30);
            const formatted_after_30_days = moment(expiry_threshold).format('YYYY-MM-DD')

            const document_condition: sequelizeObj = {
                where: {
                    IsActive: 1,
                    ExpiryDate: new Date(formatted_after_30_days),
                    FileName: { $like: 'Provider%' },
                    IsRenewed: false
                },
                attributes: ['AttachmentID', 'ExpiryDate', 'Name', 'ModifiedDate', 'ModifiedDate'],
                include: [
                    {
                        model: db.ProviderDoctor,
                        as: 'provider',
                        required: true,
                        attributes: ['ProviderDoctorID', 'ProviderGroupID']
                    }
                ]
            }

            const documents_datas = await commonService.getAllList(document_condition, db.DocumentAttachment)
            const documents_list = JSON.parse(JSON.stringify(documents_datas))

            if (documents_list && !_.isNil(documents_list) && documents_list.length > 0) {

                const notification_create_data_array: Array<Record<string, any>> = []

                await documents_list.map((document: any) => {
                    const notification_content = `The ${document.Name} document expires on ${moment(document.ExpiryDate).format('DD MMM YYYY')}`
                    const form_notification_data = {
                        AppNotificationID: uuidv4(),
                        NotificationDate: moment(new Date(current_date)).format('YYYY-MM-DD'),
                        NotificationContent: notification_content,
                        NotificationDetailedContent: notification_content,
                        Entity: 'Document',
                        ItemID: `${document.AttachmentID}`.toUpperCase(),
                        SendingUserType: 'Provider User',
                        AssigneeID: `${document.provider.ProviderDoctorID}`.toUpperCase(),
                        AssignedTo: `${document.provider.ProviderDoctorID}`.toUpperCase(),
                        ProviderClientID: null,
                        ProviderGroupID: `${document.provider.ProviderGroupID}`,
                        ProviderDoctorID: `${document.provider.ProviderDoctorID}`,
                        IsActive: true,
                        Status: `b758e70d-3acc-4e55-902b-6644451e671c`.toUpperCase(),
                        CreatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                        CreatedBy: `001edaf1-2b25-424e-aab1-d4fee51e8d4d`.toUpperCase(),
                        ModifiedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                        ModifiedBy: `001edaf1-2b25-424e-aab1-d4fee51e8d4d`.toUpperCase(),
                        RedirectLink: null,
                        PracticeManagerID: null,
                        ProviderUserID: null,
                        IsActionTaken: false,
                        IsNotificationfRead: false,
                        NotificationType: appConstant.NOTIFICATION_TYPE[0],
                        // AttachmentID: `${document.AttachmentID}`.toUpperCase(),
                    }
                    notification_create_data_array.push(form_notification_data)
                })

                await commonService.bulkCreate(notification_create_data_array, db.AppNotificationReceipts).then((saved_data) => {
                    logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_RECORD_INSERTED.replace('{{}}', 'Notification'));
                    logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_COMPLETED);
                }).catch((err: any) => {
                    logger.error(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_FAILED, err.message);
                })
            }
            else {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_RECORD_INSERTED.replace('{{}}', 'No notification'));
                logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_COMPLETED);
            }

        } catch (error: any) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

    /**
     * This function used to push alert againts document exprires within 15 days notification.
     */
    async pushDocumentAlert() {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_ALERT_NOTIFICATION_STARTED);

            const current_date = new Date();
            const expiry_threshold = new Date(current_date);
            expiry_threshold.setDate(current_date.getDate() + 15);
            const formatted_after_15_days = moment(expiry_threshold).format('YYYY-MM-DD')
            const formatted_current_date = moment(current_date).format('YYYY-MM-DD')

            const document_condition: sequelizeObj = {
                where: {
                    IsActive: 1,
                    ExpiryDate: { $between: [new Date(formatted_current_date), new Date(formatted_after_15_days)] },
                    FileName: { $like: 'Provider%' },
                    IsRenewed: false
                },
                attributes: ['AttachmentID', 'ExpiryDate', 'Name'],
                include: [
                    {
                        model: db.ProviderDoctor,
                        as: 'provider',
                        required: true,
                        attributes: ['ProviderDoctorID', 'ProviderGroupID']
                    }
                ]
            }

            const documents_datas = await commonService.getAllList(document_condition, db.DocumentAttachment)
            const documents_list = JSON.parse(JSON.stringify(documents_datas))

            const notification_create_data_array: Array<Record<string, any>> = []

            if (documents_list && !_.isNil(documents_list) && documents_list.length > 0) {

                await documents_list.forEach((document: any) => {
                    const daysUntilExpiration = moment(document.ExpiryDate).startOf('day').diff(moment().startOf('day'), 'days');

                    if (daysUntilExpiration <= 15 && daysUntilExpiration >= 0) {

                        let notification_content;

                        if (daysUntilExpiration == 0) {
                            notification_content = `The document expires today.`
                        } else {
                            notification_content = `The document expires in ${daysUntilExpiration} days.`
                        }

                        const form_notification_data = {
                            AppNotificationID: uuidv4(),
                            NotificationDate: moment(new Date(current_date)).format('YYYY-MM-DD'),
                            NotificationContent: notification_content,
                            NotificationDetailedContent: notification_content,
                            Entity: 'Document',
                            ItemID: `${document.AttachmentID}`.toUpperCase(),
                            SendingUserType: 'Induvidual',
                            AssigneeID: `${document.provider.ProviderDoctorID}`.toUpperCase(),
                            AssignedTo: `${document.provider.ProviderDoctorID}`.toUpperCase(),
                            ProviderClientID: null,
                            ProviderGroupID: `${document.provider.ProviderGroupID}`,
                            ProviderDoctorID: `${document.provider.ProviderDoctorID}`,
                            IsActive: true,
                            Status: `b758e70d-3acc-4e55-902b-6644451e671c`.toUpperCase(),
                            CreatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                            CreatedBy: `001edaf1-2b25-424e-aab1-d4fee51e8d4d`.toUpperCase(),
                            ModifiedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                            ModifiedBy: `001edaf1-2b25-424e-aab1-d4fee51e8d4d`.toUpperCase(),
                            RedirectLink: null,
                            PracticeManagerID: null,
                            ProviderUserID: null,
                            IsActionTaken: false,
                            IsNotificationfRead: false,
                            NotificationType: appConstant.NOTIFICATION_TYPE[1],
                            // AttachmentID: `${document.AttachmentID}`.toUpperCase(),
                        }
                        notification_create_data_array.push(form_notification_data)
                    }
                })

                if (notification_create_data_array && notification_create_data_array.length > 0) {
                    await commonService.bulkCreate(notification_create_data_array, db.AppNotificationReceipts).then((saved_data) => {
                        logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_RECORD_INSERTED.replace('{{}}', 'Alert notification'));
                        logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_ALERT_NOTIFICATION_COMPLETED);
                    }).catch((err: any) => {
                        logger.error(appConstant.NOTIFICATION_MESSAGES.PUSH_ALERT_NOTIFICATION_FAILED, err.message);
                    })
                }

            } else {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_RECORD_INSERTED.replace('{{}}', 'No alert notification'));
                logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_ALERT_NOTIFICATION_COMPLETED);
            }

        } catch (error: any) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.PUSH_ALERT_NOTIFICATION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

    /**
     * This function used to push alert againts document exprires within 15 days notification.
     */
    async pushPayerEnrollmentNotification() {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_STARTED);
            const current_date = new Date();

            const insurance_transaction_condition: sequelizeObj = {};

            insurance_transaction_condition.where = { IsActive: 1 }
            insurance_transaction_condition.attributes = ['InsuranceTransactionID', 'EffectiveDate', 'ProviderDoctorID', 'ProviderGroupID']
            insurance_transaction_condition.include = [
                {
                    model: db.GroupInsurance,
                    as: 'grp_insurance',
                    where: {
                        IsActive: 1,
                    },
                    attributes: ['GroupInsuranceID'],
                    required: true,
                    include: [
                        {
                            model: db.InsuranceMaster,
                            as: 'insurance_name',
                            where: { IsActive: 1 },
                            required: true,
                            attributes: ['InsuranceID', 'Name']
                        }
                    ]
                },
                {
                    model: db.InsuranceFollowup,
                    as: 'history_details_one',
                    where: { IsActive: 1, IsLast: 1, NotifiCronStatus: 0 },
                    attributes: ['InsuranceFollowupID', 'Remarks'],
                    required: true,
                    include: [
                        {
                            model: db.lookupValue,
                            as: 'status_name',
                            where: { IsActive: 1, Name: 'COMPLETED' },
                            required: true,
                            attributes: ['Name']
                        }
                    ]
                }
            ]

            const insurance_history_data = await commonService.getAllList(insurance_transaction_condition, db.InsuranceTransaction)
            const payer_data = JSON.parse(JSON.stringify(insurance_history_data));

            if (payer_data && !_.isNil(payer_data) && payer_data.length > 0) {

                const notification_create_data_array: Array<Record<string, any>> = []
                const InsuranceFollowupIDs: any = []

                await payer_data.map(async (payer: any) => {
                    const effective_date = !_.isNil(payer.EffectiveDate) ? await dateConvertor.dateFormat(payer.EffectiveDate) : null
                    const notification_content = `The payer ${payer.grp_insurance.insurance_name.Name} has been successfully credentialed and linked to the tax id effective ${!_.isNil(effective_date) ? effective_date : '-'}.`
                    const form_notification_data = {
                        AppNotificationID: uuidv4(),
                        NotificationDate: moment(new Date(current_date)).format('YYYY-MM-DD'),
                        NotificationContent: notification_content,
                        NotificationDetailedContent: payer.history_details_one.Remarks,
                        Entity: 'Payer Enrollment',
                        ItemID: `${payer.InsuranceTransactionID}`.toUpperCase(),
                        SendingUserType: 'Induvidual',
                        AssigneeID: `${payer.ProviderDoctorID}`.toUpperCase(),
                        AssignedTo: `${payer.ProviderDoctorID}`.toUpperCase(),
                        ProviderClientID: null,
                        ProviderGroupID: `${payer.ProviderGroupID}`,
                        ProviderDoctorID: `${payer.ProviderDoctorID}`,
                        IsActive: true,
                        Status: `b758e70d-3acc-4e55-902b-6644451e671c`.toUpperCase(),
                        CreatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                        CreatedBy: `001edaf1-2b25-424e-aab1-d4fee51e8d4d`.toUpperCase(),
                        ModifiedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                        ModifiedBy: `001edaf1-2b25-424e-aab1-d4fee51e8d4d`.toUpperCase(),
                        RedirectLink: null,
                        PracticeManagerID: null,
                        ProviderUserID: null,
                        IsActionTaken: false,
                        IsNotificationfRead: false,
                        NotificationType: appConstant.NOTIFICATION_TYPE[0],
                        // AttachmentID: `${document.AttachmentID}`.toUpperCase(),
                    }
                    InsuranceFollowupIDs.push({
                        InsuranceFollowupID: payer.history_details_one.InsuranceFollowupID,
                    })
                    notification_create_data_array.push(form_notification_data)
                });

                await commonService.bulkCreate(notification_create_data_array, db.AppNotificationReceipts).then(async (saved_data) => {
                    logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_RECORD_INSERTED.replace('{{}}', 'Notification'));
                    logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_COMPLETED);
                    const index = 0;
                    updateinsurance(index);
                    async function updateinsurance(index: any) {
                        const insurance = InsuranceFollowupIDs[index];
                        const body = {
                            NotifiCronStatus: 1
                        }
                        commonService.update({ InsuranceFollowupID: insurance.InsuranceFollowupID }, body, db.InsuranceFollowup).then((result) => {
                            logger.info(appConstant.NOTIFICATION_MESSAGES.INSURANCE_UPDATED_SUCCESSFULLY);
                        }).catch((err) => {
                            logger.error(appConstant.NOTIFICATION_MESSAGES.INSURANCE_UPDATED_FAILED, err.message);
                        });
                        index++;
                        if (index != InsuranceFollowupIDs.length) {
                            updateinsurance(index);
                        }

                        if (InsuranceFollowupIDs.length === index) {
                            return
                        }
                    }
                }).catch((err: any) => {
                    logger.error(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_FAILED, err.message);
                })

            }
            else {
                logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_RECORD_INSERTED.replace('{{}}', 'No notification'));
                logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_COMPLETED);
            }

        } catch (error: any) {
            logger.error(appConstant.NOTIFICATION_MESSAGES.PUSH_NOTIFICATION_FAILED, error.message);
            throw new Error(error.message)
        }
    }

}
