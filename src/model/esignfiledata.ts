import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface EsignFileDataAttributes {
    FileDataID: UUID,
    EnrollmentID: UUID,
    DocumentID: UUID,
    FileData: string,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    EnvelopeID: Text,
    RecipientViewURL: Text,
    Esigned: boolean,
    EsignedDate: Date,
    EsignExpireDate: Date,
    DocumentLocation: Text,
    EsignedDocumentLocation: Text,
}

export interface EsignFileDataModel extends Model<EsignFileDataAttributes>, EsignFileDataAttributes { }
export class EsignFileData extends Model<EsignFileDataModel, EsignFileDataAttributes>{ }

export type EsignFileDataStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): EsignFileDataModel;
};

export function EsignFileDataFactory(sequelize: Sequelize): EsignFileDataStatic {
    return <EsignFileDataStatic>sequelize.define("EsignFileData", {
        FileDataID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        EnrollmentID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        DocumentID: {
            type: SequelizeStatic.UUID,
            allowNull: false
       },
        FileData: {
            type: SequelizeStatic.TEXT,
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
        CreatedDate: {
            type: SequelizeStatic.STRING,
            allowNull: false
        },
        ModifiedBy: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ModifiedDate: {
            type: SequelizeStatic.STRING,
            allowNull: true
        },
        EnvelopeID: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        RecipientViewURL: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        Esigned: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        EsignedDate: {
            type: SequelizeStatic.STRING,
            allowNull: true
        },
        EsignExpireDate: {
            type: SequelizeStatic.STRING,
            allowNull: true
        },
        DocumentLocation: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        EsignedDocumentLocation: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "pvdr",
        tableName: 'EsignFileData'
    }
    );
}