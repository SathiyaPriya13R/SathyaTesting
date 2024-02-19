import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface InsurancePlanAttributes {
    InsurancePlanID: UUID,
    InsuranceID: UUID,
    PlanName: string,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
}

export interface InsurancePlanModel extends Model<InsurancePlanAttributes>, InsurancePlanAttributes { }
export class InsurancePlan extends Model<InsurancePlanModel, InsurancePlanAttributes>{ }

export type InsurancePlanStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): InsurancePlanModel;
};

export function InsurancePlanFactory(sequelize: Sequelize): InsurancePlanStatic {
    return <InsurancePlanStatic>sequelize.define("InsurancePlan", {
        InsurancePlanID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        InsuranceID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
        },
        PlanName: {
            type: SequelizeStatic.STRING(2000),
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
        schema: "ref",
        tableName: 'InsurancePlan'
    }
    );
}