import _ from 'lodash';
import { DocumentAttachmentModel } from '../model/documentdetails';
import {DocumentAttachment} from "../adapters/db";
import AppConstants from "../utils/constants"

const logger = require('../helpers/logger');
const appConstant = new AppConstants();

export default class DocumentService {
      async getdocumentData(id : any): Promise<any> {
    try {
      const documentDetails: DocumentAttachmentModel | null = await DocumentAttachment.findByPk(id, {
        attributes: ['FileName','Name', 'ExpiryDate', 'IssueDate', 'CreatedDate', 'CreatedBy'],
      });

      if(documentDetails&& !_.isNil(documentDetails && !_.isEmpty(documentDetails))){
        const formattedDetails = {
          fileName:documentDetails.FileName,
          name: documentDetails.Name,
          expiresOn: documentDetails.ExpiryDate,
          issueDate: documentDetails.IssueDate,
          uploadOn: documentDetails.CreatedDate,
          uploadBy: documentDetails.CreatedBy,
        };
        return {data : formattedDetails};
      }else{
        logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_FAILED)
        return {data: 'Internal error message'}
      }
  }catch(error: any){
    logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_FAILED)
    throw new Error(error.message)
  }
}
}
