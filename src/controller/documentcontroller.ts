import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import DocumentService from '../services/documentservice';
import { encrypt, decrypt } from '../helpers/aes';
import formidable from "formidable";

const appConstant = new AppConstants();
const documentService = new DocumentService()

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


    async getProviderDocument(req: Request, res: Response) {
        try {

            const filterData = !_.isNil(req.body) ? decrypt(req.body) : null
            const data = req.user
            const { limit, offset } = req.query as { limit: string, offset: string };
            const documentsResult = await documentService.getDocuments(filterData, limit, offset, data);
            res.status(200).send({ data: encrypt(JSON.stringify(documentsResult)) });
        } catch (error) {
            logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_LISTALL_FUNCTION_FAILED, error);
            res.status(400).send({ data: JSON.stringify(error) });
        }
    }
}