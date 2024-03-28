import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface DoctorLocationAttributes {
    DoctorLocationID: UUID,
    ProviderDoctorID: UUID,
    LocationID: UUID,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    PermissionSetID: UUID,
    ID: number,
    IsPrimary: boolean,
    AddressTermDate:Date
}

export interface DoctorLocationModel extends Model<DoctorLocationAttributes>, DoctorLocationAttributes { }
export class DoctorLocation extends Model<DoctorLocationModel, DoctorLocationAttributes>{ }

export type DoctorLocationStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): DoctorLocationModel;
};

export function DoctorLocationFactory(sequelize: Sequelize): DoctorLocationStatic {
    return <DoctorLocationStatic>sequelize.define("DoctorLocation", {
        DoctorLocationID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        ProviderDoctorID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        LocationID: {
            type: SequelizeStatic.UUID,
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
        PermissionSetID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ID: {
            type: SequelizeStatic.INTEGER,
            allowNull: false
        },
        IsPrimary: {
            type: SequelizeStatic.STRING(20),
            allowNull: true
        },
        AddressTermDate:{
            type:SequelizeStatic.STRING,
            allowNull:true
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "pvdr",
        tableName: 'DoctorLocation'
    }
    );
}