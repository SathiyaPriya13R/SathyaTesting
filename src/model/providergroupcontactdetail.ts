import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface ProviderGroupContactDetailAttributes {
    ProviderGroupContactDetailID: UUID,
    ProviderGroupID: UUID,
    ContactPerson: string,
    Email: string,
    Phone: string,
    Phone2: Date,
    Fax: string,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    PasswordHash: string,
    ProfileImage: Blob,
    PwdExpireDate: Date,
    ForgotPwd: boolean,
    IsActive: boolean,
    GenerateCronPassword: boolean,
    ForgetPwdCron: boolean
}

export interface ProviderGroupContactDetailModel extends Model<ProviderGroupContactDetailAttributes>, ProviderGroupContactDetailAttributes { }
export class ProviderGroupContactDetail extends Model<ProviderGroupContactDetailModel, ProviderGroupContactDetailAttributes>{ }

export type ProviderGroupContactDetailStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): ProviderGroupContactDetailModel;
};

export function ProviderGroupContactDetailFactory(sequelize: Sequelize): ProviderGroupContactDetailStatic {
    return <ProviderGroupContactDetailStatic>sequelize.define("Provider Group Contact Detail", {
        ProviderGroupContactDetailID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
        },
        Email: {
            type: SequelizeStatic.STRING(500),
            allowNull: false
        },
        ContactPerson: {
            type: SequelizeStatic.STRING(200),
            allowNull: false
        },
        Phone: {
            type: SequelizeStatic.STRING(20),
            allowNull: false
        },
        Phone2: {
            type: SequelizeStatic.STRING(20),
            allowNull: true
        },
        Fax:{
            type: SequelizeStatic.STRING(20),
            allowNull: true
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
        PasswordHash: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        ProfileImage: {
            type: SequelizeStatic.BLOB,
            allowNull: true
        },
        PwdExpireDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        ForgotPwd: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        IsActive: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        GenerateCronPassword: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        ForgetPwdCron: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        }
    },
    {

            indexes: [],
            timestamps: false,
            freezeTableName: true,
            schema: "pvdr",
            tableName: 'ProviderGroupContactDetail'
        });

    }