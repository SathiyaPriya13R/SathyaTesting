import { sequelizeObj } from '../helpers/sequelizeobj';
import { encrypt, decrypt } from '../helpers/aes';
import * as db from '../adapters/db';
import _ from 'lodash';
import AppConstants from "../utils/constants";
import CommonService from '../helpers/commonService';
const logger = require('../helpers/logger');
import eSign from '../helpers/docusign'
import path from 'path';
import ProviderService from '../services/payerservice';
import DateConvertor from '../helpers/date';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import blobservice from '../helpers/blobservice';

const appConstant = new AppConstants();
const payerService = new ProviderService();
const dateConvert = new DateConvertor();

export class eSignService {

    async getEsignURI(body_data: { name: string, email: string }, saved_data?: any) {
        const commonService = new CommonService(db.user);
        try {
            const token_data = await eSign.signClient()

            const envelope_api = await eSign.getEnvelopesApi(token_data.access_token)

            const filepath = path.join(__dirname, "Payer Dummy Document.pdf")
            // const filepath1 = path.join(__dirname, "Payer_7a578154-8922-4f17-9614-40e901bcc260.pdf")
            // const filepath2 = path.join(__dirname, "Payer_7a578154-8922-4f17-9614-40e901bcc260.pdf")
            // const filepath3 = path.join(__dirname, "1709052355542-Degree.pdf")

            const envelope = await eSign.makeEnvelope(filepath, body_data.email, body_data.name)
            // const envelope = await eSign.makeEnvelopeWithMultipleDoc(filepath1, filepath2, body_data.email, body_data.name)


            const create_envople = await envelope_api.createEnvelope(
                process.env.ACCOUNT_ID, { envelopeDefinition: envelope }
            )

            console.log("🚀 ~ eSignService ~ getEsignURI ~ create_envople.envelopeId:", create_envople.envelopeId)

            const viewRequest = await eSign.getDocusignRedirectUrl(body_data.email, body_data.name, create_envople.envelopeId, saved_data.FileDataID);

            const final_uri = await envelope_api.createRecipientView(
                process.env.ACCOUNT_ID,
                create_envople.envelopeId,
                { recipientViewRequest: viewRequest }
            )


            const updateCondition = {
                FileDataID: saved_data.FileDataID
            }
            const currentDate = new Date();
            const EsignExpireDate = new Date(currentDate.setDate(currentDate.getDate() + 2));

            const esignFileUpdate = {
                EnvelopeID: `${create_envople.envelopeId}`.toUpperCase(),
                RecipientViewURL: final_uri.url,
                Esigned: false,
                EsignExpireDate: moment(EsignExpireDate).format('YYYY-MM-DD HH:mm:ss.SSS')
            };
            await commonService.update(updateCondition, esignFileUpdate, db.EsignFileData).then((data: any) => {
                logger.info('EnvelopeId is updated');
            }).catch((error: any) => {
                logger.error(error);
            })

            return { message: 'Successfully retrive Redirect URL', data: final_uri.url, envelope_id: create_envople.envelopeId }
        } catch (error: any) {
            console.log(error)
        }
    }

    async getEsignList(user_data: { id: string, user_type: string }, filter_data?: any) {
        try {
            const commonService = new CommonService(db.user);
            logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_STARTED);
            if ((filter_data.all == false) && (_.isNil(filter_data.provider_id) || filter_data.provider_id == '')) {
                logger.info(appConstant.PAYER_MESSAGES.PAYER_FUNCTION_FAILED);
                return { message: 'Please enter provder id' };
            }
            /**
             * Checking logged in as a user or not.
             */
            const user_id = await commonService.getUserGroupProviderId(user_data, db.User, db.UserProvider);
            user_data.id = user_id ?? user_data.id;
            const filter_datas: { providers: Array<string>, payers: Array<string>, locations: Array<string> } = (!_.isNil(filter_data) && !_.isNil(filter_data.filter) && (!_.isEmpty(filter_data.filter.providers) || !_.isEmpty(filter_data.filter.payers) || !_.isEmpty(filter_data.filter.locations)))
                ? await commonService.getFilterDataIds(filter_data.filter.providers, filter_data.filter.payers, filter_data.filter.locations, {
                    provider_doctor: db.ProviderDoctor,
                    insurance_transaction: db.InsuranceTransaction,
                    group_insurance: db.GroupInsurance,
                    doctor_location: db.DoctorLocation,
                })
                : { providers: [], payers: [], locations: [] };

            /**
             * get providers based payer details start
             */
            const esign_condition: sequelizeObj = {};
            esign_condition.where = {
                [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: '117D643E-73DC-4616-9C4D-1BE73636D65F',
                ...((filter_data.all == true && !_.isNil(filter_datas) && !_.isEmpty(filter_datas.providers)) && { ProviderDoctorID: { $in: filter_datas.providers } }),
                ...((filter_data.all == false && !_.isNil(filter_data.provider_id) && !_.isEmpty(filter_data.provider_id)) && { ProviderDoctorID: { $eq: filter_data.provider_id } }),
            };
            esign_condition.attributes = ['InsuranceTransactionID', 'CreatedBy', 'ModifiedBy', 'CreatedDate', 'ModifiedDate', 'ProviderDoctorID', 'LocationID', 'TaskID']

            esign_condition.include = [
                {
                    model: db.Location,
                    as: 'location',
                    required: true,
                    where: { IsActive: 1 },
                    attributes: ['Name']
                },
                {
                    model: db.User,
                    as: 'user',
                    where: { IsActive: 1 },
                    attributes: ['DisplayName']
                },
                {
                    model: db.InsuranceFollowup,
                    as: 'history_details',
                    where: { IsActive: 1, IsLast: 1 },
                    attributes: ['insuranceTransactionID', 'StatusID', 'NextFollowupDate'],
                    include: {
                        model: db.lookupValue,
                        as: 'status',
                        where: { IsActive: 1 },
                        attributes: ['Name']
                    }
                },
                {
                    model: db.Location,
                    as: 'insurance_location',
                    where: { IsActive: 1 },
                    attributes: ['Name']
                },
                {
                    model: db.ProviderDoctor,
                    as: 'details_insurance',
                    required: true,
                    attributes: ['FirstName', 'LastName', 'MiddleName', 'ProviderDoctorID'],
                    include: [
                        {
                            model: db.lookupValue,
                            as: 'suffix_name',
                            required: true,
                            where: { IsActive: 1 },
                            attributes: ['Name']
                        },
                        {
                            model: db.lookupValue,
                            as: 'certification_name',
                            where: { IsActive: 1 },
                            attributes: ['Name']
                        }
                    ]
                },
                {
                    model: db.GroupInsurance,
                    as: 'grp_insurance',
                    where: {
                        IsActive: 1,
                        ...((filter_data.all == true && !_.isNil(filter_datas) && !_.isEmpty(filter_datas.payers)) && { InsuranceID: { $in: filter_datas.payers } })
                    },
                    attributes: ['GroupInsuranceID'],
                    include: [
                        {
                            model: db.InsuranceMaster,
                            as: 'insurance_name',
                            where: { IsActive: 1 },
                            attributes: ['InsuranceID', 'Name']
                        }
                    ]
                },
                {
                    model: db.EsignFileData,
                    as: 'esigndata',
                }
            ]

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                const searchparams: Record<string, unknown> = {};
                const searchtext = _.trim(filter_data.searchtext)
                searchparams.TaskID = { $like: '%' + searchtext + '%' };
                searchparams['$history_details.status.Name$'] = { $like: '%' + searchtext + '%' };
                searchparams['$insurance_location.Name$'] = { $like: '%' + searchtext + '%' };
                searchparams['$grp_insurance.insurance_name.Name$'] = { $like: '%' + searchtext + '%' };

                esign_condition.where['$or'] = searchparams;
                esign_condition.where = _.omit(esign_condition.where, ['searchtext']);
            }

            const esign_data: Array<Record<string, any>> = await commonService.getAllList(esign_condition, db.InsuranceTransaction);

            const esign_list = JSON.parse(JSON.stringify(esign_data));
            let esignFinallist: any = [];
            const data: any = [];
            const promises = esign_list.map(async (esigndata: any) => {
                esigndata.Name = esigndata.FirstName + esigndata.MiddleName + esigndata.LastName
                esigndata.history_details.map(async (historydata: any) => {
                    if (historydata.status.Name === 'E-SIGN') {
                        if (historydata.NextFollowupDate) {
                            const updatedNextFollowupDate = await dateConvert.dateFormat(historydata.NextFollowupDate);
                            esigndata.NextFollowupDate = updatedNextFollowupDate;
                        }
                        esigndata.status = 'E-SIGN';
                        esignFinallist.push(esigndata);
                    }
                    if (historydata.status.Name === 'PENDING WITH QWAY') {
                        if (historydata.NextFollowupDate) {
                            const updatedNextFollowupDate = await dateConvert.dateFormat(historydata.NextFollowupDate);
                            esigndata.NextFollowupDate = updatedNextFollowupDate;
                        }
                        esigndata.status = 'E-Signed'
                        esignFinallist.push(esigndata);
                    }
                    if (esigndata.ModifiedDate) {
                        const updatedModifiedDate = await dateConvert.dateFormat(esigndata.ModifiedDate);
                        esigndata.ModifiedDate = updatedModifiedDate;
                    }
                })
            });
            await Promise.all(promises)
            const groupedByDisplayName = esignFinallist.reduce((acc: { Name: any; data: any[]; }[], curr: any) => {
                let prefix: any;
                if (curr.details_insurance.certification_name.Name === 'MD') {
                    prefix = 'Dr.'
                } else {
                    prefix = ''
                }
                const displayName = `${prefix} ${curr.details_insurance.FirstName} ${curr.details_insurance.MiddleName || ''} ${curr.details_insurance.LastName} ${curr.details_insurance.certification_name.Name}`;
                const existingEntry = acc.find((entry: { Name: any; }) => entry.Name === displayName);

                if (!existingEntry) {
                    acc.push({ Name: displayName, data: [curr] });
                } else {
                    existingEntry.data.push(curr);
                }

                return acc;
            }, []);
            return groupedByDisplayName;
        } catch (error: any) {
            logger.error(appConstant.ESIGN_MESSAGE.ESIGN_FUNCTION_FAILED);
            throw new Error(error);
        }
    }

    async getSignedDocument(envelope_id: any) {

        try {

            logger.info(`signed document download function started`);

            const token_data = await eSign.signClient()

            const signed_doc = await eSign.downloadCompletedDocument(envelope_id, token_data.access_token)

            logger.info(`signed document download function completed`);

            // return { message: signed_doc?.message }
            return { message: signed_doc }

        } catch (error: any) {
            logger.info(`signed document download function failed`);
            throw new Error(error);
        }

    }

    async consoleView() {

        try {

            const token_data = await eSign.signClient()

            const envelope_api = await eSign.getEnvelopesApi(token_data.access_token)

            const filepath = path.join(__dirname, "Payer_7a578154-8922-4f17-9614-40e901bcc260.pdf")

            const envelope = await eSign.makeEnvelope(filepath, `selvadhoni640@gmail.com`, `selva`)

            const create_envople = await envelope_api.createEnvelope(
                process.env.ACCOUNT_ID, { envelopeDefinition: envelope }
            )

            console.log("🚀 ~ eSignService ~ getEsignURI ~ create_envople.envelopeId:", create_envople.envelopeId)

            const console_view = await eSign.EmbeddedConsoleView(create_envople.envelopeId);

            return { message: 'success', data: console_view }

        } catch (e: any) {
            throw new Error(e.message)
        }
    }

    async esignCreationCron() {
        try {
            const commonService = new CommonService(db.user);
            const insuranceFollowupCondition: sequelizeObj = {};
            insuranceFollowupCondition.where = {
                CronStatus: 0,
                isLast: 1,
            }
            insuranceFollowupCondition.include = [
                {
                    model: db.lookupValue,
                    as: 'status_name',
                    where: { Name: 'E-SIGN' },
                    required: true,
                    attributes: ['LookupValueID', 'Name']
                },
                {
                    model: db.InsuranceTransaction,
                    as: 'InsuranceTransaction',
                    attributes: ['InsuranceTransactionID', 'ProviderDoctorID'],
                    required: true,
                    include: [{
                        model: db.ProviderDoctor,
                        as: 'provider_details',
                        required: true,
                        attributes: ['FirstName', 'MiddleName', 'LastName', 'Email', 'ProviderDoctorID']
                    }]
                }
            ]
            const insurance = await commonService.getAllList(insuranceFollowupCondition, db.InsuranceFollowup);
            const insuranceList = JSON.parse(JSON.stringify(insurance));
            insuranceList.map(async (insuranceData: any) => {
                if (insuranceData.InsuranceTransaction && insuranceData.InsuranceTransaction.provider_details) {
                    const data = insuranceData.InsuranceTransaction.provider_details;
                    const form_notification_data = {
                        FileDataID: uuidv4(),
                        EnrollmentID: `${insuranceData.InsuranceTransactionID ? insuranceData.InsuranceTransactionID : 'ECBBBA19-E8DD-47A9-8454-889966CB085D'}`.toUpperCase(),
                        DocumentID: `7A578154-8922-4F17-9614-40E901BCC260`.toUpperCase(),
                        FileData: '',
                        IsActive: true,
                        CreatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                        CreatedBy: `CDE38098-C3BB-4C40-88F8-1D8BE29D4A2E`.toUpperCase(),
                        ModifiedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                        ModifiedBy: `CDE38098-C3BB-4C40-88F8-1D8BE29D4A2E`.toUpperCase(),
                        Esigned: false,
                        EnvelopeID: null,
                        RecipientViewURL: null,
                        EsignedDate: null,
                        EsignExpireDate: null,
                        DocumentLocation: 'https://devorcadocuments.blob.core.windows.net/orca-provider/Provider_36c9122d-fb4f-41c0-9826-1de1b7b3578a.pdf',
                        EsignedDocumentLocation: null,
                    }
                    await commonService.create(form_notification_data, db.EsignFileData).then((saved_data) => {
                        logger.info(appConstant.NOTIFICATION_MESSAGES.NOTIFICATION_RECORD_INSERTED.replace('{{}}', 'Alert notification'));
                        logger.info(appConstant.NOTIFICATION_MESSAGES.PUSH_ALERT_NOTIFICATION_COMPLETED);
                        const user_data = {
                            name: `${data.FirstName} ${data.LastName}`,
                            email: data.Email,
                        }
                        this.getEsignURI(user_data, saved_data);
                    }).catch((err: any) => {
                        logger.error(appConstant.NOTIFICATION_MESSAGES.PUSH_ALERT_NOTIFICATION_FAILED, err.message);
                        throw new Error(err);
                    })
                }
            })
        } catch (error: any) {
            throw new Error(error);
        }
    }

    async docusignComplete(data: any) {
        try {
            const commonService = new CommonService(db.user);
            const token_data = await eSign.signClient()
            const signed_doc = await eSign.downloadCompletedDocument(data.EnvelopeID, token_data.access_token);
            const esignUpdateConditon = {
                FileDataID: data.InsuranceTransactionID
            }

            const esignUpdate = {
                Esigned: 1,
                EsignedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
                EsignedDocumentLocation: `${signed_doc}`
            }
            await commonService.update(esignUpdateConditon, esignUpdate, db.EsignFileData).then((result) => {
                return result;
            }).catch((err) => {
                throw new Error(err);
            });
        } catch (error: any) {
            console.log(error)
            throw new Error(error);
        }
    }
}

export default new eSignService();