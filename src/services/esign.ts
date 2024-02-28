import { sequelizeObj } from '../helpers/sequelizeobj';
import { encrypt, decrypt } from '../helpers/aes';
import * as db from '../adapters/db';
import _ from 'lodash';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
import eSign from '../helpers/docusign'
import path from 'path';

const appConstant = new AppConstants();

export class eSignService {

    async getEsignURI(body_data: { name: string, email: string }) {

        const token_data = await eSign.signClient()

        const envelope_api = await eSign.getEnvelopesApi(token_data.access_token)

        const filepath = path.join(__dirname, "Payer_7a578154-8922-4f17-9614-40e901bcc260.pdf")

        const envelope = await eSign.makeEnvelope(filepath, body_data.email, body_data.name)

        const create_envople = await envelope_api.createEnvelope(
            process.env.ACCOUNT_ID, { envelopeDefinition: envelope }
        )
        
        console.log("🚀 ~ eSignService ~ getEsignURI ~ create_envople.envelopeId:", create_envople.envelopeId)

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