import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface InsuranceMasterAttributes {
    InsuranceID: UUID,
    Name: string,
    Description: string,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    ID: bigint,
    StateID: UUID,
}

export interface InsuranceMasterModel extends Model<InsuranceMasterAttributes>, InsuranceMasterAttributes { }
export class InsuranceMaster extends Model<InsuranceMasterModel, InsuranceMasterAttributes>{ }

export type InsuranceMasterStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): InsuranceMasterModel;
};

export function InsuranceMasterFactory(sequelize: Sequelize): InsuranceMasterStatic {
    return <InsuranceMasterStatic>sequelize.define("InsuranceMaster", {
        InsuranceID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        Name: {
            type: SequelizeStatic.STRING(2000),
            allowNull: false
        },
        Description: {
            type: SequelizeStatic.STRING(4000),
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
        ID: {
            type: SequelizeStatic.INTEGER,
            allowNull: false
        },
        StateID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "ref",
        tableName: 'InsuranceMaster'
    }
    );
}