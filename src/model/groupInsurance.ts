import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface GroupInsuranceAttributes {
    GroupInsuranceID: UUID,
    InsuranceID: string,
    ProviderGroupID: UUID,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
}

export interface GroupInsuranceModel extends Model<GroupInsuranceAttributes>, GroupInsuranceAttributes { }
export class GroupInsurance extends Model<GroupInsuranceModel, GroupInsuranceAttributes>{ }

export type GroupInsuranceStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): GroupInsuranceModel;
};

export function GroupInsuranceFactory(sequelize: Sequelize): GroupInsuranceStatic {
    return <GroupInsuranceStatic>sequelize.define("GroupInsurance", {
        GroupInsuranceID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        InsuranceID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
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
        tableName: 'GroupInsurance'
    }
    );
}