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
import { DoctorLocationFactory } from '../model/doctorlocation';
import { LocationFactory } from '../model/location';
import { GroupInsuranceFactory } from '../model/groupInsurance';
import { UserProviderGroupFactory } from '../model/userprovidergroup';
import { LoginCmsFactory } from '../model/logincms';
import { InsuranceMasterFactory } from '../model/insurancemaster';
import { LookupTypeFactory } from '../model/lookuptype';
import { ProviderSpecFactory } from '../model/providerspec';
import { SpecialityFactory } from '../model/speciality';
import { EnrollmentPlansFactory } from '../model/enrollmentplans';
import { InsurancePlanFactory } from '../model/insuranceplan';
import { DocumentAttachmentFactory } from '../model/documentattachement';

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
export const LoginCms = LoginCmsFactory(user);
export const DoctorLocation = DoctorLocationFactory(user);
export const Location = LocationFactory(user);
export const GroupInsurance = GroupInsuranceFactory(user);
export const UserProviderGroup = UserProviderGroupFactory(user);
export const InsuranceMaster = InsuranceMasterFactory(user);
export const LookupType = LookupTypeFactory(user);
export const ProviderSpec = ProviderSpecFactory(user);
export const Speciality = SpecialityFactory(user);
export const EnrollmentPlans = EnrollmentPlansFactory(user);
export const InsurancePlan = InsurancePlanFactory(user);
export const DocumentAttachment = DocumentAttachmentFactory(user);



/**
 * Associations
 */
GroupInsurance.belongsTo(InsuranceMaster, { as: 'payer', foreignKey: 'InsuranceID' })
DoctorLocation.belongsTo(Location, { as: 'location', foreignKey: 'LocationID' })
LookupType.hasMany(lookupValue, { as: 'followupstatus', foreignKey: 'LookupTypeID' })

/**
 * Provider Suffix and Certification associations
 */

ProviderDoctor.belongsTo(lookupValue, { as: 'suffix_name', foreignKey: 'SuffixID' })
ProviderDoctor.belongsTo(lookupValue, { as: 'certification_name', foreignKey: 'CertificationID' })

/**
 * For provider associations
 */
ProviderDoctor.belongsTo(ProviderGroup, { as: 'provider_group_detail', foreignKey: 'ProviderGroupID' })
// InsuranceTransaction.hasMany(EnrollmentPlans, { as: 'provider_transaction_plans', foreignKey: 'InsuranceTransactionID' })
InsuranceMaster.hasMany(InsurancePlan, { as: 'plan_details', foreignKey: 'InsuranceID' })
InsurancePlan.hasMany(EnrollmentPlans, { as: 'enrolled_plans', foreignKey: 'InsurancePlanID' })
InsuranceMaster.belongsTo(lookupValue, { as: 'insurance_location', foreignKey: 'StateID' })
EnrollmentPlans.belongsTo(ProviderSpec, { as: 'provider_spec', foreignKey: 'ProviderDepartmentSpecialityID' })

/**
 * For Provider Speciality
 */
ProviderSpec.belongsTo(Speciality, { as: 'ProviderSpec', foreignKey: 'SpecialityID' })
ProviderSpec.belongsTo(lookupValue, { as: 'BoardStatus', foreignKey: 'BoardStatusID' })


/**
 * For payer associations
 */
ProviderDoctor.hasMany(InsuranceTransaction, { as: 'insurance_details', foreignKey: 'ProviderDoctorID' })
InsuranceTransaction.belongsTo(ProviderDoctor, { as: 'details_insurance', foreignKey: 'ProviderDoctorID' })
InsuranceTransaction.belongsTo(GroupInsurance, { as: 'grp_insurance', foreignKey: 'GroupInsuranceID' })
GroupInsurance.belongsTo(InsuranceMaster, { as: 'insurance_name', foreignKey: 'InsuranceID' })
InsuranceTransaction.belongsTo(Location, { as: 'insurance_location', foreignKey: 'LocationID' })
InsuranceTransaction.hasOne(InsuranceFollowup, { as: 'insurance_status', foreignKey: 'InsuranceTransactionID' })
InsuranceFollowup.belongsTo(lookupValue, { as: 'status_name', foreignKey: 'StatusID' })
InsuranceTransaction.belongsTo(ProviderDoctor, { as: 'provider_details', foreignKey: 'ProviderDoctorID' })
InsuranceTransaction.hasMany(InsuranceFollowup, { as: 'history_details', foreignKey: 'InsuranceTransactionID' })
InsuranceFollowup.belongsTo(User, { as: 'followedby_user', foreignKey: 'ModifiedBy' })

/**
 * For Location associations
 */
ProviderDoctor.hasMany(DoctorLocation, { as: 'provider_location', foreignKey: 'ProviderDoctorID' })
DoctorLocation.belongsTo(ProviderDoctor, { as: 'location_provider', foreignKey: 'ProviderDoctorID' })
DoctorLocation.belongsTo(Location, { as: 'location_details', foreignKey: 'LocationID' })
Location.belongsTo(lookupValue, { as: 'state_name', foreignKey: 'StateID' })