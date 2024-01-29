import { Sequelize, Transaction } from "sequelize";
import * as _ from 'lodash';
import AppConstants from "../utils/constants";
import { sequelizeObj } from "./sequelizeobj";
const crypto = require('crypto');

interface queryParamType {
    type?: string,
    replacements?: Record<string, unknown>
}

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

}