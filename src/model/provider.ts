import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface ProviderDoctorAttributes {
    ProviderDoctorID: UUID,
    ProviderGroupID: UUID,
    DOB: Date,
    CAQHUserName: string,
    CAQHPassword: string,
    PECOSUserName: string,
    PECOSPassword: string,
    SsnNo: string,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    PermissionSetID: UUID,
    ID: bigint,
    FirstName: string,
    MiddleName: string,
    LastName: string,
    SuffixID: UUID,
    GenderID: UUID,
    ProviderEffectiveDate: Date,
    Hospitalaffilitaion: string,
    HomeAddressLine1: string,
    HomeAddressLine2: string,
    City: string,
    CountryID: UUID,
    ZipCode: string,
    MobileNo: string,
    PhoneNo: string,
    Email: string,
    DrivingLicense: string,
    StateID: UUID,
    CertificationID: UUID,
    NpiNo: string,
    ProfileImage: Blob,
    IsReCredentialRequired: boolean,
    CAQHNO: string,
    AttestationDate: Date,
    ProviderTypeID: UUID,
    PasswordHash: string,
    PwdExpireDate: Date,
    ForgotPwd: boolean,
}

export interface ProviderDoctorModel extends Model<ProviderDoctorAttributes>, ProviderDoctorAttributes { }
export class ProviderDoctor extends Model<ProviderDoctorModel, ProviderDoctorAttributes>{ }

export type ProviderDoctorStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): ProviderDoctorModel;
};

export function ProviderDoctorFactory(sequelize: Sequelize): ProviderDoctorStatic {
    return <ProviderDoctorStatic>sequelize.define("Provider Doctor", {
        ProviderDoctorID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
        },
        DOB: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        CAQHUserName: {
            type: SequelizeStatic.STRING(500),
            allowNull: true
        },
       CAQHPassword: {
            type: SequelizeStatic.STRING(500),
            allowNull: true
        },
        PECOSUserName:{
            type: SequelizeStatic.STRING(500),
            allowNull: true
        },
        PECOSPassword:{
            type: SequelizeStatic.STRING(500),
            allowNull: true
        },
        SsnNo: {
            type: SequelizeStatic.STRING(100),
            allowNull: true
        },
        IsActive: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        CreatedBy: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        ModifiedBy: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        CreatedDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        ModifiedDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        PermissionSetID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ID: {
            type: SequelizeStatic.INTEGER,
            allowNull: true
        },
        FirstName: {
            type: SequelizeStatic.STRING(500),
            allowNull: false
        },
        MiddleName: {
            type: SequelizeStatic.STRING(500),
            allowNull: true
        },
        LastName: {
            type: SequelizeStatic.STRING(500),
            allowNull: false
        },
        SuffixID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        GenderID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ProviderEffectiveDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        Hospitalaffilitaion: {
            type: SequelizeStatic.STRING(4000),
            allowNull: true
        },
        HomeAddressLine1: {
            type: SequelizeStatic.TEXT,
            allowNull: true,
        },
        HomeAddressLine2: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        City: {
            type: SequelizeStatic.STRING(200),
            allowNull: true
        },
        CountryID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        ZipCode: {
            type: SequelizeStatic.STRING(45),
            allowNull: true
        },
        MobileNo: {
            type: SequelizeStatic.STRING(20),
            allowNull: true
        },
        PhoneNo: {
            type: SequelizeStatic.STRING(20),
            allowNull: true
        },
        Email: {
            type: SequelizeStatic.STRING(50),
            allowNull: false
        },
        DrivingLicense: {
            type: SequelizeStatic.STRING(50),
            allowNull: true
        },
        StateID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        CertificationID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        NpiNo: {
            type: SequelizeStatic.STRING(1000),
            allowNull: false
        },
        ProfileImage: {
            type: SequelizeStatic.BLOB,
            allowNull: true
        },
        IsReCredentialRequired: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        CAQHNO: {
            type: SequelizeStatic.STRING(20),
            allowNull: true
        },
        AttestationDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        ProviderTypeID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        PasswordHash: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        PwdExpireDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        ForgotPwd: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
    },
    {

            indexes: [],
            timestamps: false,
            freezeTableName: true,
            schema: "pvdr",
            tableName: 'ProviderDoctor'
        });

    }