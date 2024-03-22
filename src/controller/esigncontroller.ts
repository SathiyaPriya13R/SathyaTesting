import { Request, Response } from 'express';
import 'dotenv/config';
import Validation from "../validations/validators"
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import { encrypt, decrypt } from '../helpers/aes';
import eSign from '../helpers/docusign'
import eSignService from '../services/esign';

const appConstant = new AppConstants();

export class esignController {

    async esign_client(request: Request, response: Response) {
        try {
            const data = await eSign.signClient()
            response.send({ data: data })
        } catch (error) {
            response.status(400).send(error);
        }
    }

    async get_esign_url(request: Request, response: Response) {

        try {
            const data: { name: string, email: string } = request.body
            await eSignService.getEsignURI(data).then((data: any) => {
                if (data.error) {
                    response.status(400).send(data.error);
                } else {
                    response.status(200).send(data);
                }
            }).catch((error) => {
                response.status(400).send(error);
            });
        } catch (error) {
            response.status(400).send(error);
        }

    }

    async esign_success(request: Request, response: Response) {
        try {
            response.status(200).send("Successfully eSigned !!!");
        } catch (error) {
            response.status(400).send(error);
        }
    }

    /**
     * List all and get by provider id - esign data
     */
    async getEsignList(req: Request, res: Response) {
        try {
            const decryptedData = (req.body.data) ? decrypt(req.body.data) : null;
            const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
            const { limit, offset }: { limit: number, offset: number } = JSON.parse(JSON.stringify(req.query));
            filter_data.limit = (limit) ? limit : null;
            filter_data.offset = (offset) ? offset : null;
            const user_data: { id: string, user_type: string } = JSON.parse(JSON.stringify(req.user))
            await eSignService.getEsignList(user_data, filter_data).then((data: any) => {
                if (data.error) {
                    res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
                } else {
                    res.status(200).send({ data: encrypt(JSON.stringify(data)) });
                }
            }).catch((error: any) => {
                res.status(400).send({ data: encrypt(JSON.stringify(error)) });
            });
        } catch (error) {
            logger.error(appConstant.ESIGN_MESSAGE.ESIGN_FUNCTION_FAILED, error);
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        }
    }

    async getSignedDocument(request: Request, response: Response) {
        try {
            const { envelope_id } = !_.isNil(request.body) ? (request.body) : null
            await eSignService.getSignedDocument(envelope_id).then((data: any) => {
                if (data.error) {
                    response.status(400).send((data.error));
                } else {
                    response.status(200).send((data));
                }
            }).catch((error: any) => {
                response.status(400).send((error));
            });
        } catch (error) {
            logger.error('Get signed document function failed', error);
            response.status(400).send((error));
        }
    }

    async consoleView(request: Request, response: Response) {
        try {
            await eSignService.consoleView().then((data: any) => {
                if (data.error) {
                    response.status(400).send((data.error));
                } else {
                    response.status(200).send((data));
                }
            }).catch((error: any) => {
                response.status(400).send((error));
            });
        } catch (error) {
            logger.error('Get signed document function failed', error);
            response.status(400).send((error));
        }
    }
    
    /**
     * Docusign Completed 
     */

    async docusignComplete(req: Request, res: Response) {
        try {
           const decryptedData = req.body.data ? decrypt(req.body.data): null;
           const filter_data = !_.isNil(decryptedData) ? JSON.parse(decryptedData) : {}
           await eSignService.docusignComplete(filter_data).then((data: any) => {
            if (data.error) {
                res.status(400).send({ data: encrypt(JSON.stringify(data.error)) });
            } else {
                res.status(200).send({ data: 'Esigned Successfully' });
            }
        }).catch((error: any) => {
            res.status(400).send({ data: encrypt(JSON.stringify(error)) });
        });
        } catch (error) {
            logger.error('Get signed document function failed', error);
            res.status(400).send((error));
        }
    }

}

export default new esignController();