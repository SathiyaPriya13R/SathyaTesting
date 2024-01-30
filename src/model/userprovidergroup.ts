import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface UserProviderGroupAttributes {
    UserProviderGroupID: UUID,
    UserID: UUID,
    ProviderGroupID: UUID,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
}

export interface UserProviderGroupModel extends Model<UserProviderGroupAttributes>, UserProviderGroupAttributes { }
export class UserProviderGroup extends Model<UserProviderGroupModel, UserProviderGroupAttributes>{ }

export type UserProviderGroupStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): UserProviderGroupModel;
};

export function UserProviderGroupFactory(sequelize: Sequelize): UserProviderGroupStatic {
    return <UserProviderGroupStatic>sequelize.define("UserProviderGroup", {
        UserProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        UserID: {
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
        schema: "sec",
        tableName: 'UserProviderGroup'
    }
    );
}