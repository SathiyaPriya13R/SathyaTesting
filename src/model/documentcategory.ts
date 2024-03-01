import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface DocumentCategoryAttributes {
  DocumentCategoryID: UUID,
  Name: String,
  DocumentCategoryFor: UUID,
  ParentCategoryID: UUID,
  IsMandatory: boolean,
  IsSystemCategory: boolean,
  ProviderClientID: UUID,
  ProviderGroupID: UUID,
  IsActive: boolean,
  CreatedBy: UUID,
  ModifiedBy: UUID,
  CreatedDate: Date,
  ModifiedDate: Date,
  IsDocumentNoMandatory: boolean
}

export interface DocumentCategoryModel extends Model<DocumentCategoryAttributes>, DocumentCategoryAttributes { }
export class DocumentCatgegory extends Model<DocumentCategoryModel, DocumentCategoryAttributes>{ }

export type DocumentCatgegoryStatic = typeof Model & {
  new(values?: Record<string, unknown>, options?: BuildOptions): DocumentCategoryModel;
};

export function DocumentCatgegoryFactory(sequelize: Sequelize): DocumentCatgegoryStatic {
  return <DocumentCatgegoryStatic>sequelize.define("DocumentCatgegory", {
    DocumentCategoryID: {
      type: SequelizeStatic.UUID,
      allowNull: false,
      primaryKey: true,
    },
    Name: {
      type: SequelizeStatic.STRING,
      allowNull: false,
    },
    DocumentCategoryFor: {
      type: SequelizeStatic.UUID,
      allowNull: false
    },
    ParentCategoryID: {
      type: SequelizeStatic.STRING,
      allowNull: true,
    },
    IsMandatory: {
      type: SequelizeStatic.BOOLEAN,
      allowNull: false
    },
    IsSystemCategory: {
      type: SequelizeStatic.BOOLEAN,
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
    },
    IsDocumentNoMandatory: {
      type: SequelizeStatic.BOOLEAN,
      allowNull: false
    }
  },
    {
      indexes: [],
      timestamps: false,
      freezeTableName: true,
      schema: "app",
      tableName: 'DocumentCategory'
    });
}