import { Sequelize, Transaction } from "sequelize";
import * as _ from 'lodash';
import AppConstants from "../utls/constants";
import { sequelizeObj } from "./sequelizeobj";


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
}
