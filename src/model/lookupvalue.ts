import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface LookUpValueAttributes {
    LookupValueID: UUID,
    Name: string,
    LookupTypeID: UUID,
    ParentID: UUID,
    IsActive: boolean,
    CreatedDate: Date,
    ModifiedDate: Date,
    Description: string,
    IsSystem: boolean,
    PermissionSetID: UUID,
    ID: bigint,
    CreatedBy: UUID,
    ModifiedBy: UUID, 
    ProviderClientID: UUID,
    ProviderGroupID: UUID,
}

export interface LookUpValueModel extends Model<LookUpValueAttributes>, LookUpValueAttributes { }
export class LookupValue extends Model<LookUpValueModel, LookUpValueAttributes>{ }

export type LookUpValueStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): LookUpValueModel;
};

export function LookUpValueFactory(sequelize: Sequelize): LookUpValueStatic {
    return <LookUpValueStatic>sequelize.define("LookUpValue", {
        LookupValueID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        Name: {
            type: SequelizeStatic.STRING(255),
            allowNull: false,
        },
        LookupTypeID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ParentID: {
            type: SequelizeStatic.UUID,
            allowNull: false
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
        Description: {
            type: SequelizeStatic.STRING(2000),
            allowNull: true
        },
        IsSystem: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        PermissionSetID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ID: {
            type: SequelizeStatic.INTEGER,
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
        ProviderClientID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
    }, 

   
    {

            indexes: [],
            timestamps: false,
            freezeTableName: true,
            schema: "ref",
            tableName: 'LookupValue'
        });

    }