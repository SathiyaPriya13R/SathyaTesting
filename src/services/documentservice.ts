import { sequelizeObj } from '../helpers/sequelizeobj';
import * as db from '../adapters/db';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
import _ from 'lodash';
import DateConvertor from '../helpers/date';
import { Sequelize } from 'sequelize';
import { DocumentAttachment, DocumentAttachmentFactory } from '../model/documentdetails';
import { encrypt, decrypt } from '../helpers/aes';
import { group, log } from 'console';

const moment = require('moment-timezone');
const { Op } = require('sequelize');

const appConstant = new AppConstants();
const dateConvert = new DateConvertor();



export default class DocumentService {


  async getDocuments(filterData: any, limit: string, offset: string, user_data: any) {
    try {

      const commonService = new CommonService(db.user);


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
        logger.info('Document retrieval successful');

        // return { data: encrypt(JSON.stringify(documents)) };
        return outputData;
      } else {
        logger.info('No documents found');
        return { data: null, message: 'No documents found' };
      }
    } catch (error: any) {
      logger.error('Error fetching documents', error);
      throw new Error(error.message);
    }
  }
}