import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface MobileRolePermissionsAttributes {
    Id: UUID,
    RoleName: string,
    ScreenName: string
    SubScreens: string,
    Permissions: string
    Status: string,
    CreatedBy: UUID,
    CreatedDate: Date,
    UpdatedBy: UUID,
    UpdatedDate: Date
}

export interface MobileRolePermissionsModel extends Model<MobileRolePermissionsAttributes>, MobileRolePermissionsAttributes { }
export class MobileRolePermissions extends Model<MobileRolePermissionsModel, MobileRolePermissionsAttributes>{ }

export type MobileRolePermissionsStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): MobileRolePermissionsModel;
};

export function MobileRolePermissionsFactory(sequelize: Sequelize): MobileRolePermissionsStatic {
    return <MobileRolePermissionsStatic>sequelize.define("MobileRolePermissions", {
        Id: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        RoleName: {
            type: SequelizeStatic.STRING(50),
            allowNull: false,
        },
        ScreenName: {
            type: SequelizeStatic.STRING(255),
            allowNull: false,
        },
        SubScreens: {
            type: SequelizeStatic.STRING(255),
            allowNull: true,
        },
        Permissions: {
            type: SequelizeStatic.STRING(255),
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
        tableName: 'MobileRolePermissions'
    });
}