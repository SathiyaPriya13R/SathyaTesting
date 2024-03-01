import { sequelizeObj } from '../helpers/sequelizeobj';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
import _ from 'lodash';
import DateConvertor from '../helpers/date';
import { Sequelize } from 'sequelize';
import { encrypt, decrypt } from '../helpers/aes';
const { Op } = require('sequelize');
import { v4 as uuidv4 } from 'uuid';
import BlobService from '../helpers/blobservice';
import path from 'path';
import moment from 'moment';

const appConstant = new AppConstants();
const blobservice = new BlobService();
const dateConvert = new DateConvertor();



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


  async getDocuments(filterData: any, limit: string, offset: string, user_data: any) {
    try {

      const commonService = new CommonService(db.user);
      logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_STARTED)
      if ((filterData.all == false) && (_.isNil(filterData.provider_id) || filterData.provider_id == '')) {
        logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_FAILED);
        return { message: 'Please enter provder id' };
      }
      /**
       * Checking logged in as a user or not.
       */
      const user_id = await commonService.getUserGroupProviderId(user_data, db.User, db.UserProvider);
      user_data.id = user_id ?? user_data.id;
      const filterDatas: { providers: Array<string>, payers: Array<string>, locations: Array<string> } = (!_.isNil(filterData) && !_.isNil(filterData.filter) && (!_.isEmpty(filterData.filter.providers) || !_.isEmpty(filterData.filter.payers) || !_.isEmpty(filterData.filter.locations)))
        ? await commonService.getFilterDataIds(filterData.filter.providers, filterData.filter.payers, filterData.filter.locations, {
          provider_doctor: db.ProviderDoctor,
          insurance_transaction: db.InsuranceTransaction,
          group_insurance: db.GroupInsurance,
          doctor_location: db.DoctorLocation,
        })
        : { providers: [], payers: [], locations: [] };

      /**
       * get providers based payer details start
       */
      const documentCondition: sequelizeObj = {};
      documentCondition.where = {
        ItemID: user_data.id,
        ...((filterData.all == true && !_.isNil(filterDatas) && !_.isEmpty(filterDatas.providers)) && { ProviderDoctorID: { $in: filterDatas.providers } }),
        ...((filterData.all == false && !_.isNil(filterData.provider_id) && !_.isEmpty(filterData.provider_id)) && { ProviderDoctorID: { $eq: filterData.provider_id } }),
      };

      documentCondition.attributes = [
        'AttachmentID',
        'ExpiryDate',
        'IsActive',
        'Name',
        'ItemID',
        'FileName'
      ]

      if (limit) {
        documentCondition.limit = +limit;
      }
      if (offset) {
        documentCondition.offset = +offset;
      }

      // Add associations
      documentCondition.include = [
        {
          model: db.ProviderDoctor,
          as: 'provider',
          required: true,
          attributes: ['ProviderDoctorID', 'FirstName', 'LastName']
        },
        {
          model: db.DocumentCategory,
          as: 'category',
          required: true,
          attributes: ['DocumentCategoryID', 'Name']
        }

      ];

      if (!_.isNil(filterData) && !_.isNil(filterData.searchtext) && filterData.searchtext != '') {
        const searchparams: Record<string, unknown> = {};

        searchparams.Name = { $like: '%' + filterData.searchtext + '%' };
        documentCondition.where['$or'] = searchparams;
        documentCondition.where = _.omit(documentCondition.where, ['searchtext']);
      }

      const documents: Array<Record<string, any>> = await commonService.getAllList(documentCondition, db.DocumentAttachment);
      const documents_list = JSON.parse(JSON.stringify(documents));

      const groupedByUserName: any = {};
      documents_list.forEach((item: any) => {
        const providerName = `${item.provider.FirstName} ${item.provider.LastName}`;
        if (!groupedByUserName[providerName]) {
          groupedByUserName[providerName] = {};
        }
        const categoryName = item.category.Name;
        if (!groupedByUserName[providerName][categoryName]) {
          groupedByUserName[providerName][categoryName] = [];
        }
        groupedByUserName[providerName][categoryName].push(item);
      });

      // Convert to the desired output format
      const outputData = [];
      for (const userName in groupedByUserName) {
        const userData: any = { Name: userName, Categories: [] };
        for (const category in groupedByUserName[userName]) {
          userData.Categories.push({
            Category: category,
            Data: groupedByUserName[userName][category]
          });
        }
        outputData.push(userData);
      }

      if (outputData && outputData.length > 0) {
        logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_COMPLETED);
        return { data: outputData, message: appConstant.DOCUMENT_MESSAGES.DOCUMENT_FOUND };
      } else {
        logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_COMPLETED);
        return { data: null, message: appConstant.DOCUMENT_MESSAGES.DOCUMENT_NOT_FOUND };
      }
    } catch (error: any) {
      logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_FAILED, error.message);
      throw new Error(error.message);
    }
  }
}
