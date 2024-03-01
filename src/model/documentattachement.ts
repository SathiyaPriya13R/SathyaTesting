import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface DocumentAttachmentAttributes {
    AttachmentID: UUID,
    DocumentLocation: String,
    DocumentCategoryID: UUID,
    AttachmentNo: string,
    IssueDate: Date,
    ExpiryDate: Date,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    Name: String,
    ItemID: UUID,
    FileName: String,
    AccessFileURL: String,
    eSignDocumentID: UUID,
    StateID: UUID,
    eSignSendRequestID: UUID,
    ReferenceURL: String,
    eSignDocumentStatus:String,
    DocumentFor: String,
}

export interface DocumentAttachmentModel extends Model<DocumentAttachmentAttributes>, DocumentAttachmentAttributes { }
export class DocumentAttachment extends Model<DocumentAttachmentModel, DocumentAttachmentAttributes>{ }

export type DocumentAttachmentStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): DocumentAttachmentModel;
};

export function DocumentAttachmentFactory(sequelize: Sequelize): DocumentAttachmentStatic {
    return <DocumentAttachmentStatic>sequelize.define("DocumentAttachment", {
        AttachmentID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        DocumentLocation:{
            type: SequelizeStatic.STRING,
            allowNull: false,
        },
        DocumentCategoryID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        AttachmentNo:{
            type: SequelizeStatic.STRING,
            allowNull: true,
        },
        IssueDate:{
            type: SequelizeStatic.DATE,
            allowNull: true,
        },
        ExpiryDate:{
            type: SequelizeStatic.DATE,
            allowNull: true,
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
        Name:{
            type: SequelizeStatic.STRING,
            allowNull: true,
        },  
        ItemID :{
            type: SequelizeStatic.UUID,
            allowNull: true,
        },
        FileName:{
            type: SequelizeStatic.STRING,
            allowNull: true,
        },
        AccessFileURL:{
            type: SequelizeStatic.STRING,
            allowNull: true,
        },
        eSignDocumentID:{
            type: SequelizeStatic.UUID,
            allowNull: true,
        },
        StateID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        eSignSendRequestID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ReferenceURL: {
            type: SequelizeStatic.STRING,
            allowNull: true
        },
        eSignDocumentStatus: {
            type: SequelizeStatic.STRING(50),
            allowNull: true
        },
        DocumentFor:{
            type: SequelizeStatic.STRING,
            allowNull: true,
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "pvdr",
        tableName: 'DocumentAttachment'
    });
}