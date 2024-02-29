import { sequelizeObj } from '../helpers/sequelizeobj';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
import _ from 'lodash';
const { Op } = require('sequelize');
import { v4 as uuidv4 } from 'uuid';
import BlobService from '../helpers/blobservice';
import path from 'path';
import moment from 'moment';

const appConstant = new AppConstants();
const blobservice = new BlobService();

export default class DocumentService {

    async uploadDocument(file: any, attachment_data: Record<string, any>): Promise<any> {
        try {

            logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_FUNCTION_STARTED);
            const commonService = new CommonService(db.user);
            const doc_data: Record<string, any> = {}

            doc_data.AttachmentID = uuidv4();
            doc_data.Name = (_.isNil(attachment_data.Name) || attachment_data.Name == '') ? path.basename(file.name) : attachment_data.Name;

            const filename = `Provider_${doc_data.AttachmentID}${path.extname(file.name)}`;
            const filepath = await blobservice.uploadStreamToBlobStorage(file, filename)

            if (filepath) {

                doc_data.DocumentFor = `${process.env.PROVIDER_CONTAINER_NAME}`
                doc_data.DocumentLocation = filepath
                doc_data.DocumentCategoryID = (!_.isNil(attachment_data.DocumentCategoryID)) ? attachment_data.DocumentCategoryID : null
                doc_data.AccessFileURL = filepath
                doc_data.FileName = filename
                doc_data.StateID = (!_.isNil(attachment_data.StateID)) ? attachment_data.StateID : null;
                doc_data.ItemID = `${attachment_data.ProviderDoctorID}`.toUpperCase()
                doc_data.CreatedBy = `${attachment_data.ProviderDoctorID}`.toUpperCase()
                doc_data.CreatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS');
                doc_data.ModifiedBy = `${attachment_data.ProviderDoctorID}`.toUpperCase()
                doc_data.ModifiedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS')
                doc_data.IsActive = true

                const saved_data = await commonService.create(doc_data, db.DocumentAttachment)

                if (saved_data && !_.isNil(saved_data)) {
                    logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_FUNCTION_COMPLETED);
                    return { data: JSON.parse(JSON.stringify(saved_data)), message: appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_SUCCESS };
                }
                else {
                    logger.info(appConstant.LOCATION_MESSAGES.LOCATION_STATUS_UPDATE_FAILED);
                    return { data: null, message: appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_FUNCTION_FAILED };
                }
            }
            else {
                logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_FUNCTION_FAILED);
                return { data: null, message: appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_IN_BLOBSTORAGE_FAILED };
            }

        } catch (error: any) {
            logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_FUNCTION_FAILED, error);
            throw new Error(error.message);
        }
    }

    async downloadDocument(attachment_id: any): Promise<{ data?: any, message: string }> {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_DOWNLOAD_FUNCTION_SATRTED);

            if (_.isNil(attachment_id) || attachment_id == '') {
                logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_DOWNLOAD_FUNCTION_FAILED);
                return { message: "Please enter an attachment id" };
            }

            const attachment_data: Record<string, any> = await commonService.getData({ where: { AttachmentID: attachment_id }, attributes: ['AttachmentID', 'AccessFileURL', 'AttachmentNo', 'Name', 'FileName'] }, db.DocumentAttachment)

            if (attachment_data && !_.isNil(attachment_data) && !_.isEmpty(attachment_data)) {
                logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_DOWNLOAD_FUNCTION_COMPLETED);
                return { data: JSON.parse(JSON.stringify(attachment_data)), message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.DOCUMENT_MESSAGES.DOCUMENT) };
            } else {
                logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_DOWNLOAD_FUNCTION_FAILED);
                return { data: null, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.DOCUMENT_MESSAGES.DOCUMENT) };
            }

        } catch (error: any) {
            logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_DOWNLOAD_FUNCTION_FAILED, error.message);
            throw new Error(error.message);
        }
    }

}