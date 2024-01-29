import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface UserProviderAttributes {
    UserProviderID: UUID,
    ProviderDoctorID: UUID,
    UserID: UUID,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date
}

export interface UserProviderModel extends Model<UserProviderAttributes>, UserProviderAttributes { }
export class UserProvider extends Model<UserProviderModel, UserProviderAttributes>{ }

export type UserProviderStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): UserProviderModel;
};

export function UserProviderFactory(sequelize: Sequelize): UserProviderStatic {
    return <UserProviderStatic>sequelize.define("UserProvider", {
        UserProviderID: {
            type: SequelizeStatic.STRING(128),
            allowNull: false,
            primaryKey: true,
        },
        ProviderDoctorID: {
            type: SequelizeStatic.STRING(128),
            allowNull: false,
        },
        UserID: {
            type: SequelizeStatic.STRING(128),
            allowNull: false,
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
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "sec",
        tableName: 'UserProvider'
    });
}