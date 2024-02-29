const docusign = require('docusign-esign')
import 'dotenv/config';
import fs from 'fs';
import pdf from 'pdf-parse';
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

            viewRequest.returnUrl = 'http://192.168.0.225:3000/api/esign/success' // This return url need to get from .env file process.env.ESIGN_RETURN_URL
            viewRequest.authenticationMethod = 'none' // OTHER METHODS - email, phone, sms, idCheck, kba
            viewRequest.email = email
            viewRequest.userName = name
            viewRequest.clientUserId = process.env.CLIENT_USER_ID

            return viewRequest

        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async makeEnvelope(filepath: any, email: any, name: any) {
        try {
            // Read the document file content
            let docPdfBytes = fs.readFileSync(filepath);

            // Extract text from the document
            const pdfData = await pdf(docPdfBytes);
            const pdfText = pdfData.text;

            // Analyze the text to identify anchor strings for sign-here tabs
            const provider_sign_string = 'Provider Signature'; // Anchor string to search for in the document
            // const signed_date_string = 'Date  ';
            // const provider_name_strign = "Provider Name (Type or use block print)";

            // Find the position of the anchor string in the document
            const anchorIndex = pdfText.indexOf(provider_sign_string);
            if (anchorIndex === -1) {
                throw new Error(`Anchor string "${provider_sign_string}" not found in the PDF`);
            }

            // Calculate dynamic position for sign-here tabs based on the anchor string
            const pageNumber = pdfText.substring(0, anchorIndex).split('\n').length; // Calculate page number
            const xOffset = 100; // Example: Offset from left
            const yOffset = 20; // Example: Offset from top

            // Create the envelope definition
            let env = new docusign.EnvelopeDefinition();
            env.emailSubject = 'Please sign this document';

            // Add the documents
            let provider_document = new docusign.Document();
            let provider_document_b64 = Buffer.from(docPdfBytes).toString('base64');
            provider_document.documentBase64 = provider_document_b64;
            provider_document.name = 'provider_mugundhan_pdf'; // can be different from actual file name
            provider_document.fileExtension = 'pdf';
            provider_document.documentId = '7';

            // The order in the docs array determines the order in the envelope
            env.documents = [provider_document];

            // Create a signer recipient dynamically based on arguments
            let singer_provider = docusign.Signer.constructFromObject({
                email: email,
                name: name,
                recipientId: 1,
                clientUserId: process.env.CLIENT_USER_ID,
                roleName: 'provider'
            });

            // Create signHere fields (also known as tabs) on the documents dynamically
            let provider_sign = docusign.SignHere.constructFromObject({
                anchorString: provider_sign_string,
                anchorYOffset: yOffset.toString(),
                anchorUnits: 'pixels',
                anchorXOffset: xOffset.toString(),
                pageNumber: pageNumber.toString(),
            });

            // let signed_date = docusign.DateSigned.constructFromObject({
            //     anchorString: signed_date_string,
            //     anchorYOffset: yOffset.toString(),
            //     anchorUnits: 'pixels',
            //     anchorXOffset: xOffset.toString(),
            //     pageNumber: pageNumber.toString(),
            //     value: 'Date'
            // });

            // let provider_name = docusign.FullName.constructFromObject({
            //     anchorString: provider_name_strign,
            //     anchorYOffset: yOffset.toString(),
            //     anchorUnits: 'pixels',
            //     anchorXOffset: xOffset.toString(),
            //     pageNumber: pageNumber.toString(),
            //     value: name
            // });

            // Tabs are set per recipient / signer
            let provider_sign_tab = docusign.Tabs.constructFromObject({
                signHereTabs: [provider_sign] // signed_date, provider_name
            });
            singer_provider.tabs = provider_sign_tab;

            // Add the recipient to the envelope object
            let recipients = docusign.Recipients.constructFromObject({
                signers: [singer_provider],
            });
            env.recipients = recipients;

            // Request that the envelope be sent by setting |status| to "sent".
            // To request that the envelope be created as a draft, set to "created"
            env.status = 'sent';

            return env;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Below two funcion currently not using -- this functions uses for
     * one check the status of the envelop 
     * another on download the signed document.
     */

    // Function to periodically check envelope status and download signed document
    async checkEnvelopeStatusAndDownload(envelopeId: any) {
        try {
            const apiClient = new docusign.ApiClient();
            apiClient.setBasePath('https://demo.docusign.net/restapi'); // Use appropriate base path
            const accountId = '<your-account-id>';
            const accessToken = '<your-access-token>'; // Replace with your access token
            apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

            const envelopesApi = new docusign.EnvelopesApi(apiClient);

            // Query envelope status
            const envelopeStatus = await envelopesApi.getEnvelope(accountId, envelopeId);

            // Check if envelope has been signed or completed
            if (envelopeStatus.status === 'completed' || envelopeStatus.status === 'signed') {
                // Download signed document
                await this.downloadCompletedDocument(envelopeId);
            } else {
                console.log('Envelope has not been signed yet.');
            }
        } catch (error) {
            console.error('Error checking envelope status and downloading document:', error);
        }
    }

    // Function to download completed PDF document
    async downloadCompletedDocument(envelopeId: any) {
        try {
            const apiClient = new docusign.ApiClient();
            apiClient.setBasePath('https://demo.docusign.net/restapi'); // Use appropriate base path
            const accountId = '<your-account-id>';
            const accessToken = '<your-access-token>'; // Replace with your access token
            apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

            const envelopesApi = new docusign.EnvelopesApi(apiClient);

            // Retrieve envelope documents
            const results = await envelopesApi.getDocument(accountId, envelopeId, 'combined');
            const pdfBytes = Buffer.from(results, 'binary');

            // Save PDF to local file
            const directoryPath = path.join(__dirname, 'eSigned');
            fs.writeFileSync(path.join(directoryPath, `signed_document_${envelopeId}.pdf`), pdfBytes);

            console.log('PDF document downloaded and saved successfully.');
        } catch (error) {
            console.error('Error downloading and saving PDF document:', error);
        }
    }

}

export default new eSign();