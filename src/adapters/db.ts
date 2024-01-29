import AppDatabase from '../database/connect';
import { UserFactory } from '../model/user';
import { LookUpValueFactory } from '../model/lookupvalue';
import { PGroupFactory } from '../model/providergroup';
import { ProviderGroupContactDetailFactory } from '../model/providergroupcontactdetail';
import { ProviderDoctorFactory } from '../model/provider';
import { MobilePermissionsFactory } from '../model/mobilepermissions';
import { MobileRolePermissionsFactory } from '../model/mobilerolepermissions';
import { InsuranceTransactionFactory } from '../model/insurancetransaction';
import { InsuranceFollowupFactory } from '../model/insurancefollowup';
import { UserProviderFactory } from '../model/userprovider';
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
export const ProviderGroupContact = ProviderGroupContactDetailFactory(user);
export const ProviderDoctor = ProviderDoctorFactory(user);
export const MobilePermissions = MobilePermissionsFactory(user);
export const MobileRolePermissions = MobileRolePermissionsFactory(user);
export const InsuranceTransaction = InsuranceTransactionFactory(user);
export const InsuranceFollowup = InsuranceFollowupFactory(user);
export const UserProvider = UserProviderFactory(user);