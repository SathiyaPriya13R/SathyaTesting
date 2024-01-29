import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface InsuranceTransactionAttributes {
    InsuranceTransactionID: UUID,
    GroupInsuranceID: UUID,
    CredentialTypeID: UUID,
    Notes: string,
    TAT: number,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    PermissionSetID: UUID,
    ApplicationStartDate: Date,
    ApplicationSubmittedDate: Date,
    ApplicationReceivedDate: Date,
    EffectiveDate: Date,
    RecredentialingDate: Date,
    NoOfDaysCompleted: number,
    NoOfDaysPending: number,
    DocumentRecievedDate: Date,
    ProviderDoctorID: UUID,
    DoctorLocationID: UUID,
    TaskID: string,
    ID: number,
    ApplicationReceivedByPayerDate: Date,
    IsReCredentialRequired: boolean,
    ProviderGroupID: UUID,
    LocationID: UUID,
    EnrollmentTypeID: UUID,
}

export interface InsuranceTransactionModel extends Model<InsuranceTransactionAttributes>, InsuranceTransactionAttributes { }
export class InsuranceTransaction extends Model<InsuranceTransactionModel, InsuranceTransactionAttributes>{ }

export type InsuranceTransactionStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): InsuranceTransactionModel;
};

export function InsuranceTransactionFactory(sequelize: Sequelize): InsuranceTransactionStatic {
    return <InsuranceTransactionStatic>sequelize.define("InsuranceTransaction", {
        InsuranceTransactionID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        GroupInsuranceID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
        },
        CredentialTypeID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        Notes: {
            type: SequelizeStatic.STRING(50),
            allowNull: false,
        },
        TAT: {
            type: SequelizeStatic.INTEGER,
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
        ApplicationStartDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        ApplicationSubmittedDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        ApplicationReceivedDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        EffectiveDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        RecredentialingDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        NoOfDaysCompleted: {
            type: SequelizeStatic.INTEGER,
            allowNull: true
        },
        NoOfDaysPending: {
            type: SequelizeStatic.INTEGER,
            allowNull: true
        },
        DocumentRecievedDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        ProviderDoctorID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        DoctorLocationID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        TaskID: {
            type: SequelizeStatic.STRING,
            allowNull: true
        },
        ID: {
            type: SequelizeStatic.INTEGER,
            allowNull: false
        },
        ApplicationReceivedByPayerDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        IsReCredentialRequired: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        LocationID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        EnrollmentTypeID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "pvdr",
        tableName: 'InsuranceTransaction'
    });
}