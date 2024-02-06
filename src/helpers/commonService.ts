import { Sequelize, Transaction } from "sequelize";
import * as _ from 'lodash';
import AppConstants from "../utils/constants";
import { sequelizeObj } from "./sequelizeobj";
const crypto = require('crypto');
import jwt from 'jsonwebtoken';

interface queryParamType {
    type?: string,
    replacements?: Record<string, unknown>
}

const appConstant = new AppConstants();

export default class CommonService {
    db!: Sequelize;
    constructor(database: Sequelize) {
        this.db = database;
    }
    getData(parameters: sequelizeObj, accessObject: any): Promise<Record<string, unknown>> {
        const promise = new Promise<Record<string, unknown>>((resolve: (value: any) => void, reject: (value: any) => void) => {
            return this.db.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, (t: Transaction) => {
                return accessObject.findOne(parameters, { transaction: t }).then((data: Record<string, unknown>) => {
                    resolve(data);
                }).catch((error: Error) => {
                    t.rollback();
                    reject(error);
                });
            });
        });
        return promise;
    }

    update(condition: Record<string, unknown>, data: Record<string, unknown>, accessObject: any): Promise<Record<string, unknown>> {
        const promise = new Promise<Record<string, unknown>>((resolve: (value: any) => void, reject: (value: any) => void) => {
            return this.db.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, (t: Transaction) => {
                return accessObject.update(data, { returning: true, plain: true, where: condition }, { transaction: t }).then(async () => {
                    const finalResult = await accessObject.findOne({ where: condition });
                    resolve(finalResult);
                }).catch((error: Error) => {
                    t.rollback();
                    reject(error);
                });
            });
        });
        return promise;
    }

    getAllList(parameters: sequelizeObj, accessObject: any): Promise<Record<string, unknown>[]> {
        const promise = new Promise<Record<string, unknown>[]>((resolve: (value: any) => void, reject: (value: any) => void) => {
            return this.db.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, (t: Transaction) => {
                return accessObject.findAll(parameters, { transaction: t }).then((data: Record<string, unknown>[]) => {
                    resolve(data);
                }).catch((error: Error) => {
                    t.rollback();
                    reject(error);
                });
            })
        });
        return promise;
    }

    executeQuery(querystring: string, queryparams: queryParamType) {
        const promise = new Promise<Record<string, unknown> | [unknown[], unknown] | Record<string, string> | Record<string, unknown>[]>((resolve: (value: any) => void, reject: (value: any) => void) => {
            return this.db.query(querystring, queryparams).then((data: Record<string, unknown> | [unknown[], unknown] | Record<string, string>) => {
                resolve(data);
            }).catch((error: Error) => {
                reject(error);
            });
        });
        return promise;
    }

    passwordHash(password: any, data: any) {
        try {
            // The value stored in [dbo].[AspNetUsers].[PasswordHash]
            var hashedPwd = data.PasswordHash;
            var hashedPasswordBytes = new Buffer(hashedPwd, 'base64');

            var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

            var saltString = "";
            var storedSubKeyString = "";

            // build strings of octets for the salt and the stored key
            for (var i = 1; i < hashedPasswordBytes.length; i++) {
                if (i > 0 && i <= 16) {
                    saltString += hexChar[(hashedPasswordBytes[i] >> 4) & 0x0f] + hexChar[hashedPasswordBytes[i] & 0x0f]
                }
                if (i > 0 && i > 16) {
                    storedSubKeyString += hexChar[(hashedPasswordBytes[i] >> 4) & 0x0f] + hexChar[hashedPasswordBytes[i] & 0x0f];
                }
            }

            // TODO remove debug - logging passwords in prod is considered 
            // tasteless for some odd reason

            // This is where the magic happens. 
            // If you are doing your own hashing, you can (and maybe should)
            // perform more iterations of applying the salt and perhaps
            // use a stronger hash than sha1, but if you want it to work
            // with the [as of 2015] Microsoft Identity framework, keep
            // these settings.
            var nodeCrypto = crypto.pbkdf2Sync(new Buffer(password), new Buffer(saltString, 'hex'), 1000, 256, 'sha1');

            // get a hex string of the derived bytes
            var derivedKeyOctets = nodeCrypto.toString('hex').toUpperCase();

            // The first 64 bytes of the derived key should
            // match the stored sub key
            if (derivedKeyOctets.indexOf(storedSubKeyString) === 0) {
                return true;
            } else {
                return false
            }
        } catch (error) {
            return error;
        }
    }

    hashPassword = (password: string) => {
        try {
            const salt = crypto.randomBytes(16);
            const saltstring = new Buffer(salt).toString('hex');
            const nodecrypto = crypto.pbkdf2Sync(new Buffer(password), new Buffer(saltstring, 'hex'), 1000, 256, 'sha1');
            const hashinhex = "00" + saltstring + nodecrypto.toString('hex').toUpperCase();
            const finalhash = Buffer.from(hashinhex, 'hex').toString('base64')
            return finalhash;
        } catch (error) {
            return error
        }
    }

    /**
     * Generate Auth token
     */

    generateAuthToken = (userData: Record<string, any>) => jwt.sign({
        id: userData.ID,
        user_type: userData.user_type,
        email: userData.Email,
        displayName: userData.DisplayName,
        type: userData.type,
        providerGroupContactId: userData.ProviderGroupContactId
    },
        `${process.env.JWT_SECRECT_KEY}`,
        { expiresIn: '3d' }
    )

    /**
    * This function used to get the ProviderGroupID or ProviderDoctorID when login as a user.
    */
    async getUserGroupProviderId(user_data: { id: string, user_type: string }, user_access_object: any, user_provider_access_object: any): Promise<string> {
        try {
            let user_id: string;
            const user_object = await this.getData({ where: { Id: user_data.id }, attributes: ['Id', 'ProviderGroupID'] }, user_access_object);
            const user_obj = JSON.parse(JSON.stringify(user_object));

            user_id = (!_.isNil(user_obj) && (user_data.user_type === appConstant.USER_TYPE[0])) ? !_.isNil(user_obj.ProviderGroupID) ? user_obj.ProviderGroupID : null : null;

            if (!_.isNil(user_obj) && (user_data.user_type === appConstant.USER_TYPE[1])) {
                const usr_pvdrgrp_data = await this.getData({ where: { UserID: user_obj.Id }, attributes: ['ProviderDoctorID'] }, user_provider_access_object);
                const provider_id: { ProviderDoctorID: string } = !_.isNil(usr_pvdrgrp_data) ? JSON.parse(JSON.stringify(usr_pvdrgrp_data)) : null;
                user_id = provider_id.ProviderDoctorID;
            }

            return Promise.resolve(user_id);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Global apply filter functionality.
     */
    async getFilterDataIds(providers: Array<string>, payers: Array<string>, locations: Array<string>, access_object: { provider_doctor: any, insurance_transaction: any, group_insurance: any, doctor_location: any }): Promise<{ providers: Array<string>, payers: Array<string>, locations: Array<string> }> {
        try {

            let data: { providers: Array<string>, payers: Array<string>, locations: Array<string> } = { providers: [], payers: [], locations: [] }

            const getAllNeededIds = async (neededIds: Array<string>, ids: Array<string>, provider: boolean, payer: boolean, location: boolean) => {

                let provider_ids: Array<string> = (provider) ? ids : [];
                let payer_ids: Array<string> = (payer) ? ids : [];
                let location_ids: Array<string> = (location) ? ids : [];

                if (location || payer) {
                    if (location && location_ids.length > 0 && neededIds.includes('provider')) {
                        const location_data: Array<Record<string, any>> = await this.getAllList({ where: { IsActive: 1, LocationID: { $in: location_ids } }, attributes: ['ProviderDoctorID'] }, access_object.doctor_location);
                        const location_data_ids: Array<string> = await location_data.map(location_data => location_data.ProviderDoctorID);
                        provider_ids.push(...location_data_ids);
                    }
                    if (payer && payer_ids.length > 0 && neededIds.includes('provider')) {
                        const group_insurance_data: Array<Record<string, any>> = await this.getAllList({ where: { IsActive: 1, InsuranceID: { $in: payer_ids } }, attributes: ['GroupInsuranceID'] }, access_object.group_insurance);
                        const group_insurance_data_ids: Array<string> = group_insurance_data.map(grpinsurance => grpinsurance.GroupInsuranceID);
                        const provider_insurance_data: Array<Record<string, any>> = await this.getAllList({ where: { IsActive: 1, GroupInsuranceID: { $in: group_insurance_data_ids } }, attributes: ['ProviderDoctorID'] }, access_object.insurance_transaction);
                        const provider_insurance_data_ids: Array<string> = provider_insurance_data.map(pinsurance => pinsurance.ProviderDoctorID);
                        provider_ids.push(...provider_insurance_data_ids);
                    }
                }

                if (neededIds.includes('payer')) {
                    const group_insurance_data: Array<Record<string, any>> = await this.getAllList({ where: { IsActive: 1, ProviderDoctorID: { $in: provider_ids } }, attributes: ['GroupInsuranceID'] }, access_object.insurance_transaction);
                    const group_insurance_data_ids: Array<string> = group_insurance_data.map(grpinsurance => grpinsurance.GroupInsuranceID);
                    const insurance_data: Array<Record<string, any>> = await this.getAllList({ where: { IsActive: 1, GroupInsuranceID: { $in: group_insurance_data_ids } }, attributes: ['InsuranceID'] }, access_object.group_insurance)
                    const insurance_data_ids: Array<string> = insurance_data.map(insurance => insurance.InsuranceID);
                    payer_ids.push(...insurance_data_ids);
                }

                if (neededIds.includes('location')) {
                    const location_data: Array<Record<string, any>> = await this.getAllList({ where: { IsActive: 1, ProviderDoctorID: { $in: provider_ids } }, attributes: ['LocationID'] }, access_object.doctor_location);
                    const location_data_ids: Array<string> = location_data.map(location_data => location_data.LocationID);
                    location_ids.push(...location_data_ids);
                }

                return {
                    providers: _.uniq(provider_ids),
                    payers: _.uniq(payer_ids),
                    locations: _.uniq(location_ids)
                }
            }

            if ((!_.isNil(providers) && !_.isEmpty(providers)) && (!_.isNil(payers) && !_.isEmpty(payers)) && (!_.isNil(locations) && !_.isEmpty(locations))) {
                data = { providers, payers, locations }
            }

            if ((!_.isNil(providers) && !_.isEmpty(providers)) && (_.isArray(payers) && _.isEmpty(payers)) && (_.isArray(locations) && _.isEmpty(locations))) {
                const datas = await getAllNeededIds(['payer', 'location'], providers, true, false, false)
                data.providers = datas.providers
                data.payers = datas.payers
                data.locations = datas.locations
            }

            if ((!_.isNil(providers) && !_.isEmpty(providers)) && (_.isArray(payers) && _.isEmpty(payers)) && (!_.isNil(locations) && !_.isEmpty(locations))) {
                const datas = await getAllNeededIds(['payer'], providers, true, false, false)
                data.providers = datas.providers
                data.payers = datas.payers
                data.locations = locations
            }

            if ((!_.isNil(providers) && !_.isEmpty(providers)) && (!_.isNil(payers) && !_.isEmpty(payers)) && (_.isArray(locations) && _.isEmpty(locations))) {
                const datas = await getAllNeededIds(['location'], providers, true, false, false)
                data.providers = datas.providers
                data.payers = payers
                data.locations = datas.locations
            }

            if ((_.isArray(providers) && _.isEmpty(providers)) && (!_.isNil(payers) && !_.isEmpty(payers)) && (_.isArray(locations) && _.isEmpty(locations))) {
                const datas = await getAllNeededIds(['location', 'provider'], payers, false, true, false)
                data.providers = datas.providers
                data.payers = datas.payers
                data.locations = datas.locations
            }

            if ((_.isArray(providers) && _.isEmpty(providers)) && (!_.isNil(payers) && !_.isEmpty(payers)) && (!_.isNil(locations) && !_.isEmpty(locations))) {
                const datas = await getAllNeededIds(['provider'], payers, false, true, false)
                data.providers = datas.providers
                data.payers = datas.payers
                data.locations = locations
            }

            if ((_.isArray(providers) && _.isEmpty(providers)) && (_.isArray(payers) && _.isEmpty(payers)) && (!_.isNil(locations) && !_.isEmpty(locations))) {
                const datas = await getAllNeededIds(['provider', 'payer'], locations, false, false, true)
                data.providers = datas.providers
                data.payers = datas.payers
                data.locations = datas.locations
            }

            data.providers = data.providers.map(provider => provider.toString())
            data.payers = data.payers.map(payer => payer.toString())
            data.locations = data.locations.map(location => location.toString())
            return Promise.resolve(data)
        } catch (error) {
            return Promise.reject(error)
        }
    }

}