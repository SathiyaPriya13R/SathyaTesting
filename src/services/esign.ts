import { sequelizeObj } from '../helpers/sequelizeobj';
import { encrypt, decrypt } from '../helpers/aes';
import * as db from '../adapters/db';
import _ from 'lodash';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
import eSign from '../helpers/docusign'

const appConstant = new AppConstants();

export class eSignService {

    async getEsignURI(body_data: { name: string, email: string }) {

        const token_data = await eSign.signClient()

        const envelope_api = await eSign.getEnvelopesApi(token_data.access_token)

        const envelope = await eSign.createEnvelope(body_data.name, body_data.email)

        const create_envople = await envelope_api.createEnvelope(
            process.env.ACCOUNT_ID, { envelopeDefinition: envelope }
        )

        const viewRequest = await eSign.getDocusignRedirectUrl(body_data.email, body_data.name)

        const final_uri = await envelope_api.createRecipientView(
            process.env.ACCOUNT_ID,
            create_envople.envelopeId,
            { recipientViewRequest: viewRequest }
        )

        return { message: 'Successfully retrive Redirect URL', data: final_uri.url }
    }
}

export default new eSignService();