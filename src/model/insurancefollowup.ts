import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface InsuranceFollowupAttributes {
    InsuranceFollowupID: UUID,
    InsuranceTransactionID: UUID,
    StatusID: UUID,
    NextFollowupDate: Date,
    Remarks: string,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    PermissionSetID: UUID,
    ID: number,
    DailedNumber: string,
    EmailID: string,
    SpokeWithORemailto: string,
    IsLast: boolean,
}

export interface InsuranceFollowupModel extends Model<InsuranceFollowupAttributes>, InsuranceFollowupAttributes { }
export class InsuranceFollowup extends Model<InsuranceFollowupModel, InsuranceFollowupAttributes>{ }

export type InsuranceFollowupStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): InsuranceFollowupModel;
};

export function InsuranceFollowupFactory(sequelize: Sequelize): InsuranceFollowupStatic {
    return <InsuranceFollowupStatic>sequelize.define("InsuranceFollowup", {
        InsuranceFollowupID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        InsuranceTransactionID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        StatusID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        NextFollowupDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        Remarks: {
            type: SequelizeStatic.STRING,
            allowNull: true,
        },
        IsActive: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        CreatedBy: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ModifiedBy: {
            type: SequelizeStatic.UUID,
            allowNull: true
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
        DailedNumber: {
            type: SequelizeStatic.STRING(20),
            allowNull: true
        },
        EmailID: {
            type: SequelizeStatic.STRING(200),
            allowNull: true
        },
        SpokeWithORemailto: {
            type: SequelizeStatic.STRING(200),
            allowNull: true
        },
        IsLast: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "pvdr",
        tableName: 'InsuranceFollowup'
    }
    );
}