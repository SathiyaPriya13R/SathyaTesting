import { Request, Response } from 'express';
import 'dotenv/config';
import Validation from "../validations/validators"
import AppConstants from '../utils/constants';
import _ from 'lodash';
const logger = require('../helpers/logger');
import { encrypt, decrypt } from '../helpers/aes';
import eSign from '../helpers/docusign'
import eSignService from '../services/esign';

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

}

export default new esignController();