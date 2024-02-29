import { Request, Response } from 'express';
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import DocumentService from '../services/documentservice';
import { encrypt, decrypt } from '../helpers/aes';

const appConstant = new AppConstants();
const documentService = new DocumentService()

export default class DocumentController {

    async getProviderDocument(req: Request, res: Response) {
        try {
            // Decrypt data if present in the request body
            // const decryptedData = req.body.data ? decrypt(req.body.data) : null;
            // const filterData = _.isNil(decryptedData) ? null : JSON.parse(decryptedData);
            const filterData = req.body;
            // Extract limit and offset from query parameters
            const data = req.user
            const { limit, offset } = req.query as { limit: string, offset: string };

            // Call the getDocuments service method
            const documentsResult = await documentService.getDocuments(filterData, limit, offset, data);

            // Respond with the result
            res.status(200).send(documentsResult);
        } catch (error) {
            console.error("Error fetching provider documents:", error);
            res.status(400).send({ data: JSON.stringify(error) });
        }
    }
}