import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface PGroupAttributes {
    ProviderGroupID: UUID,
    ProviderClientID: UUID,
    Name: string,
    PermitNumber: string,
    GroupNpi: string,
    SowDate: Date,
    TaxID: string,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    Doingbusinessas: string,
    CLIANumber: string,
    Taxonomy: string,
    PracticeID: bigint,
    IsReCredentialRequired: boolean,
}

export interface PGroupModel extends Model<PGroupAttributes>, PGroupAttributes { }
export class ProviderGroup extends Model<PGroupModel, PGroupAttributes>{ }

export type PGroupStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): PGroupModel;
};

export function PGroupFactory(sequelize: Sequelize): PGroupStatic {
    return <PGroupStatic>sequelize.define("Provider Group", {
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        ProviderClientID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
        },
        Name: {
            type: SequelizeStatic.STRING(2000),
            allowNull: false
        },
        PermitNumber: {
            type: SequelizeStatic.STRING(50),
            allowNull: true
        },
        GroupNpi: {
            type: SequelizeStatic.STRING(50),
            allowNull: true
        },
        SowDate:{
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        TaxID: {
            type: SequelizeStatic.STRING(50),
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
        Doingbusinessas: {
            type: SequelizeStatic.STRING(2000),
            allowNull: true
        },
        CLIANumber: {
            type: SequelizeStatic.STRING(20),
            allowNull: true
        },
        Taxonomy: {
            type: SequelizeStatic.STRING(50),
            allowNull: false
        },
        PracticeID: {
            type: SequelizeStatic.INTEGER,
            allowNull: false
        },
        IsReCredentialRequired: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        }
    },
    {

            indexes: [],
            timestamps: false,
            freezeTableName: true,
            schema: "pvdr",
            tableName: 'ProviderGroup'
        });

    }