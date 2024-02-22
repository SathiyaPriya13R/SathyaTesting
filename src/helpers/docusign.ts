// import docusign from 'docusign-esign';
const docusign = require('docusign-esign')
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

// https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=022c7050-974e-4360-a1fa-6fb0912dff70&redirect_uri=http://localhost:3000/api/esign

export class eSign {

    private access_token: any

    async signClient() {

        try {
            const expiresInDays = 5;
            const expiresInSeconds = expiresInDays * 24 * 60 * 60;

            const docusign_api_client = new docusign.ApiClient();

            docusign_api_client.setBasePath(`${process.env.BASE_API}`)

            const results = await docusign_api_client.requestJWTUserToken(
                `${process.env.INTEGRATION_KEY}`,
                `${process.env.USER_ID}`,
                ["signature"],
                fs.readFileSync(path.join(__dirname, "private.key")),
                expiresInSeconds);

            const token_datas = results.body

            this.access_token = token_datas.access_token

            return token_datas

        } catch (error: any) {
            throw new Error(error.message)
        }

    }

    async getEnvelopesApi(access_token: any) {
        try {
            await new eSign().signClient()
            const docusign_api_client = new docusign.ApiClient();
            const token = !_.isNil(access_token) ? access_token : this.access_token
            docusign_api_client.setBasePath(`${process.env.BASE_API}`)
            docusign_api_client.addDefaultHeader('Authorization', 'Bearer ' + token);
            return new docusign.EnvelopesApi(docusign_api_client);
        } catch (error: any) {
            throw new Error(error)
        }
    }

    async createEnvelope(name: any, email: any) {

        try {
            const env = new docusign.EnvelopeDefinition()
            env.templateId = process.env.TEMPLATE_ID

            const singer_provider = docusign.TemplateRole.constructFromObject({
                name: name,
                email: email,
                recipientId: '1',
                clientUserId: process.env.CLIENT_USER_ID,
                roleName: 'provider'
            })

            env.templateRoles = [singer_provider]
            env.status = 'sent'

            return env
        } catch (error: any) {
            throw new Error(error)
        }

    }

    async getDocusignRedirectUrl(email: any, name: any) {
        try {
            const viewRequest = new docusign.RecipientViewRequest();

            viewRequest.returnUrl = 'http://192.168.0.225:3000/api/esign/success'
            viewRequest.authenticationMethod = 'none'
            viewRequest.email = email
            viewRequest.userName = name
            viewRequest.clientUserId = process.env.CLIENT_USER_ID

            return viewRequest

        } catch (error: any) {
            throw new Error(error.message)
        }
    }

}

export default new eSign();