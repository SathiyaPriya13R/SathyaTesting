import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface LoginCmsAttributes {
    CmsId: UUID,
    PageTitle: string,
    PageDescription: string,
    PageUrl: string,
    Status: string,
    CreatedBy: UUID,
    CreatedDate: Date,
    UpdatedBy: UUID,
    UpdatedDate: Date
}

export interface LoginCmsModel extends Model<LoginCmsAttributes>, LoginCmsAttributes { }
export class LoginCms extends Model<LoginCmsModel, LoginCmsAttributes>{ }

export type LoginCmsStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): LoginCmsModel;
};

export function LoginCmsFactory(sequelize: Sequelize): LoginCmsStatic {
    return <LoginCmsStatic>sequelize.define("LoginCms", {
        CmsId: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        PageTitle: {
            type: SequelizeStatic.STRING(50),
            allowNull: false,
        },
        PageDescription: {
            type: SequelizeStatic.STRING,
            allowNull: false,
        },
        PageUrl: {
            type: SequelizeStatic.STRING,
            allowNull: false
        },
        Status: {
            type: SequelizeStatic.STRING(10),
            allowNull: false,
            defaultValue: 'Active'
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
        },
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "sec",
        tableName: 'LoginCms'
    });
}