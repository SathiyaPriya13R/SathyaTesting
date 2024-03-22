const docusign = require('docusign-esign')
import 'dotenv/config';
import fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';
import _ from 'lodash';
import BlobService from './blobservice';;

const blobservice = new BlobService();


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

            console.log("🚀 ~ eSign ~ signClient ~ this.access_token:", this.access_token)

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

    async getDocusignRedirectUrl(email: any, name: any, envelopeId: any, FileDataID: any) {
        try {
            const viewRequest = new docusign.RecipientViewRequest();
            viewRequest.returnUrl = `http://192.168.0.225:3000/api/esign/success?envelopId${envelopeId}&FileDataId${FileDataID}`; // This return url need to get from .env file process.env.ESIGN_RETURN_URL
            viewRequest.authenticationMethod = 'none' // OTHER METHODS - email, phone, sms, idCheck, kba
            viewRequest.email = email
            viewRequest.userName = name
            viewRequest.clientUserId = process.env.CLIENT_USER_ID

            // viewRequest.display = 'embedded'

            // viewRequest.frameAncestors = ["http://localhost:3000/", "https://apps-d.docusign.com/send/"];
            // viewRequest.messageOrigins = ["https://apps-d.docusign.com/send/"]

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
            provider_document.name = 'provider_pdf'; // can be different from actual file name
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
            //     value: '06/03/2024'
            // });

            // let provider_name = docusign.FullName.constructFromObject({
            //     anchorString: provider_name_strign,
            //     anchorYOffset: yOffset.toString(),
            //     anchorUnits: 'pixels',
            //     anchorXOffset: xOffset.toString(),
            //     pageNumber: pageNumber.toString(),
            //     value: name
            // });

            // const signed_date = docusign.DateSigned.constructFromObject({
            //     anchorString: '/Date/',
            //     anchorYOffset: yOffset.toString(),
            //     anchorUnits: 'pixels',
            //     anchorXOffset: xOffset.toString(),
            //     pageNumber: pageNumber.toString(),
            //     value: '06/03/2024'
            //   });

            //   const tabs = docusign.Tabs.constructFromObject({
            //     dateSignedTabs: [dateSignedTab]
            //   });

            //   signer.tabs = tabs;
            // Tabs are set per recipient / signer
            let provider_sign_tab = docusign.Tabs.constructFromObject({
                signHereTabs: [provider_sign] // signed_date, provider_name
                // dateSignedTabs: [signed_date] 
            }); singer_provider.tabs = provider_sign_tab;

            // Add the recipient to the envelope object
            let recipients = docusign.Recipients.constructFromObject({
                signers: [singer_provider],
            });
            env.recipients = recipients;


            // Set expiry date
            env.expireAfter = '2'; // Expiry in days

            // Request that the envelope be sent by setting |status| to "sent".
            // To request that the envelope be created as a draft, set to "created"
            env.status = 'sent';

            return env;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    async makeEnvelopeWithMultipleDoc(filepath1: any, filepath2: any, email: any, name: any) {
        try {
            // Read the content of the additional documents
            let doc1PdfBytes = fs.readFileSync(filepath1);
            let doc2PdfBytes = fs.readFileSync(filepath2);
            // let doc3PdfBytes = fs.readFileSync(filepath3);

            // Create envelope definition
            let env = new docusign.EnvelopeDefinition();
            env.emailSubject = 'Please sign these documents';

            env.documents = [];

            // Add the documents
            let doc1 = new docusign.Document();
            doc1.documentBase64 = Buffer.from(doc1PdfBytes).toString('base64');
            doc1.name = 'document1.pdf';
            doc1.fileExtension = 'pdf';
            doc1.documentId = '1'; // Ensure unique documentId
            env.documents.push(doc1);

            let doc2 = new docusign.Document();
            doc2.documentBase64 = Buffer.from(doc2PdfBytes).toString('base64');
            doc2.name = 'document2.pdf';
            doc2.fileExtension = 'pdf';
            doc2.documentId = '2'; // Ensure unique documentId
            env.documents.push(doc2);

            // let doc3 = new docusign.Document();
            // doc3.documentBase64 = Buffer.from(doc3PdfBytes).toString('base64');
            // doc3.name = 'document3.pdf';
            // doc3.fileExtension = 'pdf';
            // doc3.documentId = '3'; // Ensure unique documentId
            // env.documents.push(doc3);

            // Create signer recipient dynamically
            let signer = docusign.Signer.constructFromObject({
                email: email,
                name: name,
                recipientId: '8',
                clientUserId: process.env.CLIENT_USER_ID,
                roleName: 'provider'
            });

            // Create signeHre tabs for each document
            let signHere1 = docusign.SignHere.constructFromObject({
                anchorString: 'Provider Signature', // Adjust as needed for each document
                anchorYOffset: '20',
                anchorUnits: 'pixels',
                anchorXOffset: '100',
                // pageNumber: '1'
            });
            // let signHere2 = docusign.SignHere.constructFromObject({
            //     anchorString: 'Provider Signature', // Adjust as needed for each document
            //     anchorYOffset: '20',
            //     anchorUnits: 'pixels',
            //     anchorXOffset: '100',
            //     // pageNumber: '1'
            // });
            // let signHere3 = docusign.SignHere.constructFromObject({
            //     anchorString: 'Provider Signature', // Adjust as needed for each document
            //     anchorYOffset: '20',
            //     anchorUnits: 'pixels',
            //     anchorXOffset: '100',
            //     pageNumber: '1'
            // });

            // Create tabs for each document
            let tabs = docusign.Tabs.constructFromObject({
                signHereTabs: [signHere1] // signHere2, signHere3
            });
            signer.tabs = tabs;

            // Add the recipient to the envelope
            // env.recipients = docusign.Recipients.constructFromObject({
            //     signers: [signer]
            // });

            // Add the recipient to the envelope object
            let recipients = docusign.Recipients.constructFromObject({
                signers: [signer],
            });
            env.recipients = recipients;


            // Set envelope status to "sent"
            env.status = 'sent';
            // console.log("🚀 ~ eSign ~ makeEnvelopeWithMultipleDoc ~ env:", env)

            return env;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    async makeEnvelopeWithMultipleSignerAndDoc(filepath1: any, filepath2: any, filepath3: any, signers: any) {
        try {
            // Read the content of the additional documents
            let doc1PdfBytes = fs.readFileSync(filepath1);
            let doc2PdfBytes = fs.readFileSync(filepath2);
            let doc3PdfBytes = fs.readFileSync(filepath3);

            // Create envelope definition
            let env = new docusign.EnvelopeDefinition();
            env.emailSubject = 'Please sign these documents';

            // Add the documents
            let doc1 = new docusign.Document();
            doc1.documentBase64 = Buffer.from(doc1PdfBytes).toString('base64');
            doc1.name = 'document1.pdf';
            doc1.fileExtension = 'pdf';
            doc1.documentId = '1'; // Ensure unique documentId
            env.documents.push(doc1);

            let doc2 = new docusign.Document();
            doc2.documentBase64 = Buffer.from(doc2PdfBytes).toString('base64');
            doc2.name = 'document2.pdf';
            doc2.fileExtension = 'pdf';
            doc2.documentId = '2'; // Ensure unique documentId
            env.documents.push(doc2);

            let doc3 = new docusign.Document();
            doc3.documentBase64 = Buffer.from(doc3PdfBytes).toString('base64');
            doc3.name = 'document3.pdf';
            doc3.fileExtension = 'pdf';
            doc3.documentId = '3'; // Ensure unique documentId
            env.documents.push(doc3);

            // Create recipients dynamically
            let docusignSigners = [];
            for (let i = 0; i < signers.length; i++) {
                let signer = docusign.Signer.constructFromObject({
                    email: signers[i].email,
                    name: signers[i].name,
                    recipientId: (i + 1).toString(), // Recipient IDs must be unique
                    clientUserId: process.env.CLIENT_USER_ID,
                    roleName: signers[i].roleName
                });

                // Create signHere tabs for each document for the current signer
                let signHere1 = docusign.SignHere.constructFromObject({
                    anchorString: 'Provider Signature', // Adjust as needed for each document
                    anchorYOffset: '20',
                    anchorUnits: 'pixels',
                    anchorXOffset: '100',
                    pageNumber: '1'
                });
                let signHere2 = docusign.SignHere.constructFromObject({
                    anchorString: 'Provider Signature', // Adjust as needed for each document
                    anchorYOffset: '20',
                    anchorUnits: 'pixels',
                    anchorXOffset: '100',
                    pageNumber: '1'
                });
                let signHere3 = docusign.SignHere.constructFromObject({
                    anchorString: 'Provider Signature', // Adjust as needed for each document
                    anchorYOffset: '20',
                    anchorUnits: 'pixels',
                    anchorXOffset: '100',
                    pageNumber: '1'
                });

                // Create tabs for each document for the current signer
                let tabs = docusign.Tabs.constructFromObject({
                    signHereTabs: [signHere1, signHere2, signHere3]
                });
                signer.tabs = tabs;

                docusignSigners.push(signer);
            }

            // Add the recipients to the envelope
            env.recipients = docusign.Recipients.constructFromObject({
                signers: docusignSigners
            });

            // Set envelope status to "sent"
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
    // async checkEnvelopeStatusAndDownload(envelopeId: any) {
    //     try {
    //         const apiClient = new docusign.ApiClient();
    //         apiClient.setBasePath('https://demo.docusign.net/restapi'); // Use appropriate base path
    //         const accountId = '<your-account-id>';
    //         const accessToken = '<your-access-token>'; // Replace with your access token
    //         apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

    //         const envelopesApi = new docusign.EnvelopesApi(apiClient);

    //         // Query envelope status
    //         const envelopeStatus = await envelopesApi.getEnvelope(accountId, envelopeId);

    //         // Check if envelope has been signed or completed
    //         if (envelopeStatus.status === 'completed' || envelopeStatus.status === 'signed') {
    //             // Download signed document
    //             await this.downloadCompletedDocument(envelopeId);
    //         } else {
    //             console.log('Envelope has not been signed yet.');
    //         }
    //     } catch (error) {
    //         console.error('Error checking envelope status and downloading document:', error);
    //     }
    // }

    // Function to download completed PDF document
    async downloadCompletedDocument(envelopeId: any, access_token: any) {

        try {
            const docusign_api_client = new docusign.ApiClient();
            const accountId = `${process.env.ACCOUNT_ID}`;
            docusign_api_client.setBasePath(`${process.env.BASE_API}`);
            docusign_api_client.addDefaultHeader('Authorization', 'Bearer ' + access_token);

            const envelopesApi = new docusign.EnvelopesApi(docusign_api_client);

            // Retrieve envelope documents
            const results = await envelopesApi.getDocument(accountId, String(envelopeId), 'combined');
            const pdfBytes = Buffer.from(results, 'binary');

            // Save PDF to local file
            // const directoryPath = path.join(__dirname, '..', 'signed_documents');

            // // Check if the directory exists, if not create it
            // if (!fs.existsSync(directoryPath)) {
            //     fs.mkdirSync(directoryPath, { recursive: true });
            // }

            // fs.writeFileSync(path.join(directoryPath, `signed_document_${envelopeId}.pdf`), pdfBytes);

            // const file_path = path.resolve(__dirname, '..', 'signed_documents', `signed_document_${envelopeId}.pdf`);

            // fs.writeFileSync(path.join(directoryPath, `signed_document_${envelopeId}.pdf`), pdfBytes);

            // const file_path = path.resolve(__dirname, '..', 'signed_documents', `signed_document_${envelopeId}.pdf`);

            const filename = `Provider_${envelopeId}${path.extname('signed_document_${envelopeId}.pdf')}`;
            const filepath = await blobservice.uploadEsignDocuToBlobStorage(pdfBytes, filename)


            return filepath;

        } catch (error) {
            console.error('Error downloading and saving PDF document:', error);
        }
    }

    async EmbeddedConsoleView(envelopeId: any) {
        console.log("🚀 ~ eSign ~ EmbeddedConsoleView ~ envelopeId:", envelopeId)

        try {
            const token = await new eSign().signClient()
            console.log("🚀 ~ eSign ~ EmbeddedConsoleView ~ token:", token.access_token)

            let dsApiClient = new docusign.ApiClient();
            dsApiClient.setBasePath(`${process.env.BASE_API}`);

            dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token.access_token);
            let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

            // Create the NDSE view
            let viewRequest = await this.makeConsoleViewRequest(envelopeId, 'envelope');
            // Call the CreateSenderView API
            // Exceptions will be caught by the calling function
            let results = await envelopesApi.createConsoleView(
                process.env.ACCOUNT_ID, { consoleViewRequest: viewRequest });
            let url = results.url;
            console.log(`NDSE view URL: ${url}`);
            return ({ redirectUrl: url })
        } catch (error) {
            console.log(error)
        }

    }


    async makeConsoleViewRequest(envelopeId: any, startingView: any) {

        try {
            let viewRequest = new docusign.ConsoleViewRequest();
            // Set the url where you want the recipient to go once they are done 
            // with the NDSE. It is usually the case that the 
            // user will never "finish" with the NDSE.
            // Assume that control will not be passed back to your app.
            viewRequest.returnUrl = process.env.ESIGN_RETURN_URL
            if (startingView == "envelope" && envelopeId) {
                viewRequest.envelopeId = envelopeId
            }
            return viewRequest
        } catch (error) {
            console.log(error)
        }

    }

}

export default new eSign();