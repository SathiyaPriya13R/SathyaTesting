import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import DocumentService from '../services/documentservice';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const documentService = new DocumentService();

export default class DocumentController {
    async getDocumentDetails(req: Request, res: Response): Promise<void> {
        try {
          const provider_ID = req.params.id;
          await documentService.getdocumentData(provider_ID).then((data: any)=>{
            const response = JSON.parse(JSON.stringify(data));
            res.status(200).json({ response });
          }).catch(Error => {
            res.status(500).json({ Error: 'Internal Server Error' });
          })
          
        } catch (error) {
          logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_FAILED)
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
}