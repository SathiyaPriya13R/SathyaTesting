import { hostname } from 'os';
import AppDatabase from '../database/connect';
import { UserFactory } from '../model/user';
import { LookUpValueFactory } from '../model/lookupvalue';
import { PGroupFactory } from '../model/providergroup';
require('dotenv').config();

const access = {
    dbname: process.env.DB_DATABASE as string,
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    hostName: process.env.DB_HOSTNAME as string,
    logging: true
}
const db = new AppDatabase(access);
//initialize db connection
export const user = db.init();

export const User = UserFactory(user);
export const lookupValue = LookUpValueFactory(user);
export const ProviderGroup = PGroupFactory(user);