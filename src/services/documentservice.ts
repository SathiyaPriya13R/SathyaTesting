import _ from 'lodash';
import { DocumentAttachmentModel } from '../model/documentattachment';
import { DocumentAttachment } from "../adapters/db";
import { sequelizeObj } from '../helpers/sequelizeobj';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
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

  async getdocumentData(attachmentid: any) {
    try {
      logger.info(appConstant.SERVICE + appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_STARTED);
      const commonService = new CommonService(db.user);
      const documentCondition: sequelizeObj = {};
      documentCondition.where = {
        AttachmentID: attachmentid,
      };
      documentCondition.attributes = ['FileName', 'Name', 'ExpiryDate', 'IssueDate', 'CreatedDate', 'CreatedBy'];
      documentCondition.include = [{
        model: db.ProviderDoctor,
        as: 'provider',
        required: true,
        attributes: ['FirstName', 'MiddleName', 'LastName']
      }];
      const documentDetails = await commonService.getData(documentCondition, db.DocumentAttachment);
      const documentAddress = JSON.parse(JSON.stringify(documentDetails));
      documentAddress.ExpiryDate = !_.isNil(documentAddress.ExpiryDate) ? await dateConvert.DateFormatWithTime(documentAddress.ExpiryDate) : null;
      documentAddress.IssueDate = !_.isNil(documentAddress.IssueDate) ? await dateConvert.dateFormat(documentAddress.IssueDate) : null;
      documentAddress.CreatedDate = !_.isNil(documentAddress.CreatedDate) ? await dateConvert.dateFormat(documentAddress.CreatedDate) : null;

      const uploadedBy = {
        Name: documentAddress.provider ? `${documentAddress.provider.FirstName} ${documentAddress.provider.MiddleName || ''} ${documentAddress.provider.LastName}` : ""
      };

      if (documentAddress && !_.isNil(documentAddress) && !_.isEmpty(documentAddress)) {
        return {
          data: { ...documentAddress, uploadedby: uploadedBy },
          message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.APP_FILTER)
        };
      } else {
        return { data: null, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.APP_FILTER) };
      }
    } catch (error: any) {
      logger.info(appConstant.SERVICE + appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_FAILED);
      throw new Error(error.message);
    }
  }

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
        doc_data.DocumentSoftDelete = 0
        doc_data.IsRenewed = 0
        doc_data.RefAttachmentID = attachment_data.RefAttachmentID

        const saved_data: any = await commonService.create(doc_data, db.DocumentAttachment)

        await this.updateDocumentAndTriggerNotification(attachment_data.RefAttachmentID, doc_data);

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

  async getDocuments(user_data: { id: string, user_type: string }, filter_data?: any): Promise<any> {
    try {

      const commonService = new CommonService(db.user);
      logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_STARTED)

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

      const provider_condition: sequelizeObj = {};
      provider_condition.where = {
        [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: user_data.id,
        ...((!_.isNil(filter_datas) && !_.isEmpty(filter_datas.providers)) && { ProviderDoctorID: { $in: filter_datas.providers } }),
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
          model: db.DocumentAttachment,
          as: 'provider_document',
          where: {
            DocumentSoftDelete: 0,
            FileName: { $like: 'Provider%' },
          },
          attributes: ['AttachmentID', 'FileName', 'Name', 'ExpiryDate', 'DocumentCategoryID', 'ItemID', 'StateID'],
          include: [
            {
              model: db.DocumentCategory,
              as: 'category',
              required: true,
              attributes: ['DocumentCategoryID', 'Name']
            }
          ]
        }
      ]

      if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
        const searchparams: Record<string, unknown> = {};
        const searchtext = _.trim(filter_data.searchtext);

        // searchparams['$provider_document.FileName$'] = { $like: '%' + searchtext + '%' };
        searchparams['$provider_document.Name$'] = { $like: '%' + searchtext + '%' };
        // searchparams['$provider_document.category.Name$'] = { $like: '%' + searchtext + '%' };

        if (searchtext && !_.isNil(searchtext) && Date.parse(searchtext) != null && searchtext.toString() != 'Invalid date' && !isNaN(Date.parse(searchtext))) {
          const start_date = moment(searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 00:00:00.000')
          const end_date = moment(searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 23:59:59.999')
          const date_range = [start_date, end_date]
          searchparams['$provider_document.ExpiryDate$'] = { $between: date_range };
        }

        provider_condition.where['$or'] = searchparams;
        provider_condition.where = _.omit(provider_condition.where, ['searchtext']);
      }

      provider_condition.order = [['FirstName', 'ASC']]

      const provider_data: Array<Record<string, any>> = await commonService.getAllList(provider_condition, db.ProviderDoctor);
      const provider_list = JSON.parse(JSON.stringify(provider_data));
      const provider_ids: Array<string> = provider_list.map((provider: any) => provider.ProviderDoctorID)

      const document_array: Array<any> = await this.getAllDocuments(provider_ids, filter_data)

      await provider_list.map((provider: any) => {
        delete provider.provider_document
      })

      const final_data: Array<Record<string, any>> = []

      await provider_list.map((provider: any) => {
        document_array.map(async (document: any) => {
          if (provider.ProviderDoctorID == document.ItemID) {
            const formattedExpiryDate = !_.isNil(document.ExpiryDate) ? await dateConvert.dateFormat(document.ExpiryDate) : null
            document.ExpiryDate = formattedExpiryDate
            if (!provider.provider_document) {
              provider.provider_document = [];
            }
            provider.provider_document.push(document);
          }
        })
        if (!_.isNil(document_array) && !_.isEmpty(document_array)) {
          final_data.push(provider)
        }
      })

      async function transformProvidersToCategoryObject(providers_data: any) {

        for (let i = 0; i < providers_data.length; i++) {
          const provider_datas = providers_data[i];
          const category_object: any = {};

          for (let j = 0; j < provider_datas.provider_document.length; j++) {
            const document_data = provider_datas.provider_document[j];
            const category_name = document_data.category.Name;

            if (!category_object[category_name]) {
              category_object[category_name] = [];
            }

            category_object[category_name].push(document_data);
          }

          provider_datas.provider_document = Object.keys(category_object).map(category_name => ({
            category_name,
            documents: category_object[category_name]
          }));
        }

        return providers_data;
      }

      const transformedData = await transformProvidersToCategoryObject(final_data);

      if (transformedData && transformedData.length > 0) {
        logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_COMPLETED);
        return { data: transformedData, message: appConstant.DOCUMENT_MESSAGES.DOCUMENT_FOUND };
      } else {
        logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_COMPLETED);
        return { data: null, message: appConstant.DOCUMENT_MESSAGES.DOCUMENT_NOT_FOUND };
      }

    } catch (error: any) {
      logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_FAILED, error.message);
      throw new Error(error.message);
    }
  }

  async deletedocumentData(provider_id: any) {
    try {
      const commonService = new CommonService(db.user)
      logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_DELETE_FUNCTION_STARTED);
      const update_condition = {
        DocumentSoftDelete: 1
      }
      const response = await commonService.update({ AttachmentID: provider_id }, update_condition, db.DocumentAttachment)
      return { message: appConstant.DOCUMENT_DETAILS_MESSAGE.DELETE_SUCCESSFULLY }
    } catch (error: any) {
      logger.error(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_DELETE_FUNCTION_FAILED, error.message);
      throw new Error(error.message);
    }
  }

  async getAllDocuments(provider_ids: Array<any>, filter_data: any) {

    return new Promise((resolve: (value: Array<any>) => void, reject: (value: any) => void): void => {
      const commonService = new CommonService(db.user);
      try {
        const document_datas: Array<any> = []
        const document_condition: sequelizeObj = {}
        const idx: number = 0;
        getDocument(idx);
        async function getDocument(idx: number) {
          const provider_id = provider_ids[idx];
          if (idx != provider_ids.length) {

            document_condition.where = {
              DocumentSoftDelete: 0,
              FileName: { $like: 'Provider%' },
              ItemID: { $eq: provider_id }
            }

            document_condition.attributes = ['AttachmentID', 'FileName', 'Name', 'ExpiryDate', 'DocumentCategoryID', 'ItemID', 'StateID']

            document_condition.include = [
              {
                model: db.DocumentCategory,
                as: 'category',
                required: true,
                attributes: ['DocumentCategoryID', 'Name']
              }
            ]

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
              const searchparams: Record<string, unknown> = {};
              const searchtext = _.trim(filter_data.searchtext);

              // searchparams.FileName = { $like: '%' + searchtext + '%' };
              searchparams.Name = { $like: '%' + searchtext + '%' };
              searchparams['$category.Name$'] = { $like: '%' + searchtext + '%' };

              if (searchtext && !_.isNil(searchtext) && Date.parse(searchtext) != null && searchtext.toString() != 'Invalid date' && !isNaN(Date.parse(searchtext))) {
                const start_date = moment(searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 00:00:00.000')
                const end_date = moment(searchtext, 'DD MMM YYYY').format('YYYY-MM-DD 23:59:59.999')
                const date_range = [start_date, end_date]
                searchparams.ExpiryDate = { $between: date_range };
              }

              document_condition.where['$or'] = searchparams;
              document_condition.where = _.omit(document_condition.where, ['searchtext']);
            }

            document_condition.limit = (filter_data.limit) ? +filter_data.limit : undefined
            document_condition.offset = (filter_data.offset) ? +filter_data.offset : undefined

            const document_data: Array<Record<string, any>> = await commonService.getAllList(document_condition, db.DocumentAttachment);
            const document_list = JSON.parse(JSON.stringify(document_data));
            document_datas.push(document_list)
            idx++
            getDocument(idx)

          } else {
            const flatted_locations = document_datas.flat();
            resolve(flatted_locations)
          }
        }
      } catch (e) {
        reject(e);
      }
    })

  }

  async updateDocumentAndTriggerNotification(RefAttachmentID: any, document: any) {

    return new Promise(async (resolve: (value: any) => void, reject: (value: any) => void): Promise<void> => {
      const commonService = new CommonService(db.user);
      try {

        await commonService.update({ AttachmentID: RefAttachmentID }, { IsRenewed: true }, db.DocumentAttachment).then(async saved_data => {

          const provider_data = await commonService.getData({ where: { ProviderDoctorID: document.ItemID }, attributes: ['ProviderDoctorID', 'ProviderGroupID'] }, db.ProviderDoctor)
          const provider = JSON.parse(JSON.stringify(provider_data))

          const current_date = new Date();
          const notification_data = {
            AppNotificationID: uuidv4(),
            NotificationDate: moment(new Date(current_date)).format('YYYY-MM-DD'),
            NotificationContent: `The renewed document (${document.Name}) has been uploaded successfully.`,
            NotificationDetailedContent: `The renewed document (${document.Name}) has been uploaded successfully.`,
            Entity: 'Document',
            ItemID: `${document.AttachmentID}`.toUpperCase(),
            SendingUserType: 'Induvidual',
            AssigneeID: `${provider.ProviderDoctorID}`.toUpperCase(),
            AssignedTo: `${provider.ProviderDoctorID}`.toUpperCase(),
            ProviderClientID: null,
            ProviderGroupID: `${provider.ProviderGroupID}`,
            ProviderDoctorID: `${provider.ProviderDoctorID}`,
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
          }
          await commonService.create(notification_data, db.AppNotificationReceipts)

          resolve(true)
        }).catch(e => {
          reject(e);
        })

      } catch (e) {
        reject(e);
      }
    })
  }

}
