import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface ProviderSpecAttributes {
    ProviderDepartmentSpecialityID: UUID,
    ProviderDepartmentID: String,
    SpecialityID: UUID,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    BoardStatusID: UUID,
    IssueDate: Date,
    ExpireDate: Date,
    Remarks: String,
    DepartmentID: UUID,
    ProviderDoctorID: UUID,
    DeparmentID: UUID,
    BoardExamdate: Date,
    IsPrimary: boolean,
    SpecialityTaxanomy: String,
}

export interface ProviderSpecModel extends Model<ProviderSpecAttributes>, ProviderSpecAttributes { }
export class ProviderSpec extends Model<ProviderSpecModel, ProviderSpecAttributes>{ }

export type ProviderSpecStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): ProviderSpecModel;
};

export function ProviderSpecFactory(sequelize: Sequelize): ProviderSpecStatic {
    return <ProviderSpecStatic>sequelize.define("ProviderSpecAttributes", {
        ProviderDepartmentSpecialityID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        ProviderDepartmentID: {
            type: SequelizeStatic.STRING(1),
            allowNull: true,
        },
        SpecialityID: {
            type: SequelizeStatic.UUID,
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
        BoardStatusID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        IssueDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        ExpireDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        Remarks: {
            type: SequelizeStatic.STRING(2000),
            allowNull: true
        },
        DepartmentID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ProviderDoctorID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        DeparmentID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        BoardExamdate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        IsPrimary: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        SpecialityTaxanomy: {
            type: SequelizeStatic.STRING(300),
            allowNull: true
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "pvdr",
        tableName: 'ProviderSpeciality'
    });
}