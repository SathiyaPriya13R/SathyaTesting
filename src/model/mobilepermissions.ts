import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface MobilePermissionsAttributes {
    PermissionId: UUID,
    PermissionName: string,
    PermissionOperation: string,
    Status: string,
    CreatedBy: UUID,
    CreatedDate: Date,
    UpdatedBy: UUID,
    UpdatedDate: Date
}

export interface MobilePermissionsModel extends Model<MobilePermissionsAttributes>, MobilePermissionsAttributes { }
export class MobilePermissions extends Model<MobilePermissionsModel, MobilePermissionsAttributes>{ }

export type MobilePermissionsStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): MobilePermissionsModel;
};

export function MobilePermissionsFactory(sequelize: Sequelize): MobilePermissionsStatic {
    return <MobilePermissionsStatic>sequelize.define("MobilePermissions", {
        PermissionId: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        PermissionName: {
            type: SequelizeStatic.STRING(50),
            allowNull: false,
        },
        PermissionOperation: {
            type: SequelizeStatic.STRING(50),
            allowNull: false
        },
        Status: {
            type: SequelizeStatic.STRING(20),
            allowNull: false
        },
        CreatedBy: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        CreatedDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        UpdatedBy: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        UpdatedDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "sec",
        tableName: 'MobilePermissions'
    });
}