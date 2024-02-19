import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface EnrollmentPlansAttributes {
    TransactionPlanID: UUID,
    InsuranceTransactionID: UUID,
    InsurancePlanID: UUID,
    ProviderDepartmentSpecialityID: UUID,
    EffectiveOn: Date,
    ExpiresOn: Date,
    ConfirmWith: string,
    Remarks: string,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
}

export interface EnrollmentPlansModel extends Model<EnrollmentPlansAttributes>, EnrollmentPlansAttributes { }
export class EnrollmentPlans extends Model<EnrollmentPlansModel, EnrollmentPlansAttributes>{ }

export type EnrollmentPlansStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): EnrollmentPlansModel;
};

export function EnrollmentPlansFactory(sequelize: Sequelize): EnrollmentPlansStatic {
    return <EnrollmentPlansStatic>sequelize.define("EnrollmentPlans", {
        TransactionPlanID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        InsuranceTransactionID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        InsurancePlanID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        ProviderDepartmentSpecialityID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        EffectiveOn: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        ExpiresOn: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        ConfirmWith: {
            type: SequelizeStatic.STRING(250),
            allowNull: false
        },
        Remarks: {
            type: SequelizeStatic.STRING(500),
            allowNull: false
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
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "pvdr",
        tableName: 'EnrollmentPlans'
    }
    );
}