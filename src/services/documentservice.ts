import _ from 'lodash';
import { DocumentAttachmentModel } from '../model/documentattachement';
import { DocumentAttachment } from "../adapters/db";
import AppConstants from "../utils/constants"
import CommonService from '../helpers/commonService';
import * as db from "../adapters/db"
import { sequelizeObj } from '../helpers/sequelizeobj';
import DateConvertor from '../helpers/date';


const logger = require('../helpers/logger');
const appConstant = new AppConstants();
const dateConvert = new DateConvertor();


export default class DocumentService {
  async getdocumentData(attachmentid: any) {
    try {
      logger.info(appConstant.SERVICE + appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_STARTED)
      const commonService = new CommonService(db.user)
      const documentCondition: sequelizeObj = {}
      documentCondition.where = {
        AttachmentID: attachmentid,
      }
      documentCondition.attributes = ['FileName', 'Name', 'ExpiryDate', 'IssueDate', 'CreatedDate', 'CreatedBy']
      const documentDetails = await commonService.getData(documentCondition, db.DocumentAttachment)
      const documentAddress = JSON.parse(JSON.stringify(documentDetails))
      documentAddress.ExpiryDate = !_.isNil(documentAddress.ExpiryDate) ? await dateConvert.dateFormat(documentAddress.ExpiryDate) : null
      documentAddress.IssueDate = !_.isNil(documentAddress.IssueDate) ? await dateConvert.dateFormat(documentAddress.IssueDate) : null
      documentAddress.CreatedDate = !_.isNil(documentAddress.CreatedDate) ? await dateConvert.dateFormat(documentAddress.CreatedDate) : null

      if (documentAddress && !_.isNil(documentAddress) && !_.isEmpty(documentAddress)) {
        return { data: documentAddress, message: appConstant.MESSAGES.DATA_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.APP_FILTER) };
      } else {
        return { data: null, message: appConstant.MESSAGES.DATA_NOT_FOUND.replace('{{}}', appConstant.DASHBOARD_MESSAGES.APP_FILTER) };
      }
    } catch (error: any) {
      logger.info(appConstant.SERVICE + appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_FAILED)
      throw new Error(error.message)
    }
  }
}
