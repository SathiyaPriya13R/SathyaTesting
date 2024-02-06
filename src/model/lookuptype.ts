import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface LookupTypeAttributes {
    LookupTypeID: UUID,
    Name: string,
    ParentLookupTypeID: UUID,
    IsActive: boolean,
    CreatedBy: UUID,
    CreatedDate: Date,
    ModifiedBy: UUID,
    ModifiedDate: Date,
    PermissionSetID: UUID,
    IsSystem: boolean,
}

export interface LookupTypeModel extends Model<LookupTypeAttributes>, LookupTypeAttributes { }
export class LookupType extends Model<LookupTypeModel, LookupTypeAttributes>{ }

export type LookupTypeStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): LookupTypeModel;
};

export function LookupTypeFactory(sequelize: Sequelize): LookupTypeStatic {
    return <LookupTypeStatic>sequelize.define("LookupType", {
        LookupTypeID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        Name: {
            type: SequelizeStatic.STRING(255),
            allowNull: false,
        },
        ParentLookupTypeID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        IsActive: {
            type: SequelizeStatic.BOOLEAN,
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
        IsSystem: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        PermissionSetID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        CreatedBy: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ModifiedBy: {
            type: SequelizeStatic.UUID,
            allowNull: true
        }

    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "ref",
        tableName: 'LookupType'
    }
    );
}