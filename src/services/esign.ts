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

const appConstant = new AppConstants();
const payerService = new ProviderService();
const dateConvert = new DateConvertor();

export class eSignService {

    async getEsignURI(body_data: { name: string, email: string }) {

        try {

            console.log("🚀 ~ eSignService ~ getEsignURI ~ token_data:", 'token_data')
            const token_data = await eSign.signClient()
            console.log("🚀 ~ eSignService ~ getEsignURI ~ token_data:", 'token_data')

            const envelope_api = await eSign.getEnvelopesApi(token_data.access_token)
            console.log("🚀 ~ eSignService ~ getEsignURI ~ envelope_api:", 'envelope_api')

            // const filepath = path.join(__dirname, "Payer_7a578154-8922-4f17-9614-40e901bcc260.pdf")
            const filepath1 = path.join(__dirname, "Payer_7a578154-8922-4f17-9614-40e901bcc260.pdf")
            // const filepath2 = path.join(__dirname, "Payer_7a578154-8922-4f17-9614-40e901bcc260.pdf")
            const filepath3 = path.join(__dirname, "1709052355542-Degree.pdf")

            const envelope = await eSign.makeEnvelopeWithMultipleDoc(filepath1, filepath3, body_data.email, body_data.name)

            // console.log("🚀 ~ eSignService ~ getEsignURI ~ envelope:", envelope)
            // const envelope = await eSign.makeEnvelope(filepath, body_data.email, body_data.name)

            const create_envople = await envelope_api.createEnvelope(
                process.env.ACCOUNT_ID, { envelopeDefinition: envelope }
            )

            console.log("🚀 ~ eSignService ~ getEsignURI ~ create_envople:", create_envople)
            console.log("🚀 ~ eSignService ~ getEsignURI ~ create_envople.envelopeId:", create_envople.envelopeId)

            const viewRequest = await eSign.getDocusignRedirectUrl(body_data.email, body_data.name)

            const final_uri = await envelope_api.createRecipientView(
                process.env.ACCOUNT_ID,
                create_envople.envelopeId,
                { recipientViewRequest: viewRequest }
            )

            return { message: 'Successfully retrive Redirect URL', data: final_uri.url, envelope_id: create_envople.envelopeId }
        } catch (error) {
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
                [user_data.user_type === appConstant.USER_TYPE[0] ? 'ProviderGroupID' : 'ProviderDoctorID']: 'B75E4250-53F3-432E-93F8-D5FDBC63EBFE',
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
            ]

            if (!_.isNil(filter_data) && !_.isNil(filter_data.searchtext) && filter_data.searchtext != '') {
                const searchparams: Record<string, unknown> = {};

                searchparams.TaskID = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$history_details.status.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$insurance_location.Name$'] = { $like: '%' + filter_data.searchtext + '%' };
                searchparams['$grp_insurance.insurance_name.Name$'] = { $like: '%' + filter_data.searchtext + '%' };

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

            return { message: signed_doc?.message }

        } catch (error: any) {
            logger.info(`signed document download function failed`);
            throw new Error(error);
        }

    }

    async consoleView() {

        try {

            const token_data = await eSign.signClient()
            console.log("🚀 ~ eSignService ~ getEsignURI ~ token_data:", 'token_data')

            const envelope_api = await eSign.getEnvelopesApi(token_data.access_token)
            console.log("🚀 ~ eSignService ~ getEsignURI ~ envelope_api:", 'envelope_api')

            const filepath = path.join(__dirname, "Payer_7a578154-8922-4f17-9614-40e901bcc260.pdf")

            const envelope = await eSign.makeEnvelope(filepath, `srk@gmail.com`, `srk`)

            const create_envople = await envelope_api.createEnvelope(
                process.env.ACCOUNT_ID, { envelopeDefinition: envelope }
            )

            console.log("🚀 ~ eSignService ~ getEsignURI ~ create_envople.envelopeId:", create_envople.envelopeId)

            const console_view = await eSign.EmbeddedConsoleView(create_envople.envelopeId);

            console.log("🚀 ~ eSignService ~ consoleView ~ console_view:", console_view)

            return { message: 'success', data: console_view }

        } catch (e: any) {
            throw new Error(e.message)
        }
    }
}

export default new eSignService();