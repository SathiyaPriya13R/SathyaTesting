import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import DocumentService from '../services/documentservice';
import { encrypt, decrypt } from '../helpers/aes';
import formidable from "formidable";

const appConstant = new AppConstants();
const documentService = new DocumentService();

export default class DocumentController {

  async uploadDocument(request: Request, response: Response) {
    try {
      const formData = formidable({ multiples: true });
      formData.parse(request, async function (error: any, data: any, file: any) {

        if (_.isNil(file.file.type)) { response.status(400).send({ message: appConstant.DOCUMENT_MESSAGES.ENTER_VALID_DOCUMENT_DATA }); return }

        if (error) { response.status(400).send(error); return }

        try {
          const attachment_data = JSON.parse(data.attachment_data);
          const saved_data = await documentService.uploadDocument(file.file, attachment_data)

          if (saved_data.error) {
            response.status(400).send({ data: encrypt(JSON.stringify(saved_data.error)) });
          } else {
            response.status(200).send({ data: encrypt(JSON.stringify(saved_data)) });
          }
        } catch (error: any) {
          logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_FUNCTION_FAILED, error);
          response.status(400).send(error.message);
        }
      });
    } catch (error) {
      logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_FUNCTION_FAILED, error);
      response.status(400).send(error);
    }
  }


  async downloadDocument(req: Request, res: Response) {
    try {
      const attachment_id = (req.params.id) ? req.params.id : null;
      const document_data = await documentService.downloadDocument(attachment_id);
      res.status(200).send({ data: encrypt(JSON.stringify(document_data)) });
    } catch (error: any) {
      logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_DOWNLOAD_FUNCTION_FAILED, error.message);
      res.status(400).send({ data: encrypt(JSON.stringify(error)) });
    }
  }
  async getDocumentDetails(req: Request, res: Response): Promise<void> {
    try {
      const provider_ID = req.params.id ? req.params.id : null;
      logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_STARTED);
      await documentService.getdocumentData(provider_ID).then((data: any) => {
        const response = JSON.parse(JSON.stringify(data));

        logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_COMPLETED);
        res.status(200).send({ data: encrypt(JSON.stringify(response)) });
      }).catch(error => {
        res.status(400).send({ data: encrypt(JSON.stringify(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_FAILED)) });
      })
    } catch (error) {
      logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_FAILED);
      res.status(400).send({ data: encrypt(JSON.stringify(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_FUNCTION_FAILED)) });
    }
  }

  async getProviderDocument(req: Request, res: Response) {
    try {
      const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
      const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : null
      const { limit, offset }: { limit: number, offset: number } = JSON.parse(JSON.stringify(req.query));
      filter_data.limit = (limit) ? limit : null;
      filter_data.offset = (offset) ? offset : null
      const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user))
      await documentService.getDocuments(user_data, filter_data).then((data: any) => {
        if (data.error) {
          res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
        } else {
          res.status(200).send({ data: encrypt(JSON.stringify(data)) });
        }
      }).catch((error) => {
        res.status(400).send({ data: encrypt(JSON.stringify(error)) });
      });
    } catch (error) {
      logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_FAILED, error);
      res.status(400).send({ data: encrypt(JSON.stringify(error)) });
    }
  }

  async documentDelete(req: Request, res: Response) {
    try {
      const provider_ID = req.params.id ? req.params.id : null;
      logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_DELETE_FUNCTION_STARTED)
      await documentService.deletedocumentData(provider_ID).then((data: any) => {
        const response = JSON.parse(JSON.stringify(data));
        logger.info(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_DELETE_FUNCTION_COMPLETED)
        res.status(200).send({ data: encrypt(JSON.stringify(response)) });
      }).catch(error => {
        res.status(400).send({ data: encrypt(JSON.stringify(appConstant.DOCUMENT_DETAILS_MESSAGE.DOCUMENT_DELETE_FUNCTION_FAILED)) });
      })
    } catch (error) {

    }
  }

}
