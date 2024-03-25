import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface MobileAppVersionAttributes {
    AppVersionId: UUID,
    AndoridForceUpdateVersion: string,
    AndoridCurrentVersion: string,
    AndoridForceUpdateStatus: boolean,
    AndoridForceUpdateDate: string,
    AndoridCurrentVersionReleaseDate: UUID,
    iOSAndoridForceUpdateVersion: string,
    iOSAndoridCurrentVersion: string,
    iOSAndoridForceUpdateStatus: boolean,
    iOSAndoridForceUpdateDate: string,
    iOSAndoridCurrentVersionReleaseDate: UUID,
}

export interface MobileAppVersionModel extends Model<MobileAppVersionAttributes>, MobileAppVersionAttributes { }
export class MobileAppVersion extends Model<MobileAppVersionModel, MobileAppVersionAttributes>{ }

export type MobileAppVersionStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): MobileAppVersionModel;
};

export function MobileAppVersionFactory(sequelize: Sequelize): MobileAppVersionStatic {
    return <MobileAppVersionStatic>sequelize.define("MobileAppVersion", {
        AppVersionId: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        AndoridForceUpdateVersion: {
            type: SequelizeStatic.STRING(50),
            allowNull: false,
        },
        AndoridCurrentVersion: {
            type: SequelizeStatic.STRING(50),
            allowNull: false
        },
        AndoridForceUpdateStatus: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        AndoridForceUpdateDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        AndoridCurrentVersionReleaseDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        iOSForceUpdateVersion: {
            type: SequelizeStatic.STRING(50),
            allowNull: false,
        },
        iOSCurrentVersion: {
            type: SequelizeStatic.STRING(50),
            allowNull: false
        },
        iOSForceUpdateStatus: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        iOSForceUpdateDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        iOSCurrentVersionReleaseDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "ref",
        tableName: 'MobileAppVersion'
    });
}