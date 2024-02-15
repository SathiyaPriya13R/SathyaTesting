import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface SpecialityAttributes {
    SpecialityID: UUID,
    DepartmentID: UUID,
    Name: String,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    SpecialityTaxanomy: String,
}

export interface SpecialityModel extends Model<SpecialityAttributes>, SpecialityAttributes { }
export class Speciality extends Model<SpecialityModel, SpecialityAttributes>{ }

export type SpecialityStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): SpecialityModel;
};

export function SpecialityFactory(sequelize: Sequelize): SpecialityStatic {
    return <SpecialityStatic>sequelize.define("SpecialityAttributes", {
        SpecialityID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        DepartmentID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        Name: {
            type: SequelizeStatic.STRING(2000),
            allowNull: false
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
        SpecialityTaxanomy: {
            type: SequelizeStatic.STRING(300),
            allowNull: true
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "ref",
        tableName: 'Speciality'
    });
}