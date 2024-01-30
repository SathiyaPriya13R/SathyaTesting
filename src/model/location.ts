import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface LocationAttributes {
    LocationID: UUID,
    Name: string,
    ProviderGroupID: UUID,
    StateID: UUID,
    City: string,
    ZipCode: string,
    IsActive: boolean,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    CreatedDate: Date,
    ModifiedDate: Date,
    PermissionSetID: UUID,
    ID: number,
    AddressTypeID: UUID,
    AddressLine1: string,
    AddressLine2: string,
    Country: UUID,
    Fax: string,
    Phone: string,
    Phone2: string,
    FullName: string,
    AddressStartDate: Date,
    AddressTermDate: Date,
    Reason: UUID,
    CountryID: UUID,
    Email: string
}

export interface LocationModel extends Model<LocationAttributes>, LocationAttributes { }
export class Location extends Model<LocationModel, LocationAttributes>{ }

export type LocationStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): LocationModel;
};

export function LocationFactory(sequelize: Sequelize): LocationStatic {
    return <LocationStatic>sequelize.define("Location", {
        LocationID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        Name: {
            type: SequelizeStatic.STRING(100),
            allowNull: false
        },
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        StateID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        City: {
            type: SequelizeStatic.STRING(200),
            allowNull: true
        },
        ZipCode: {
            type: SequelizeStatic.STRING(45),
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
        PermissionSetID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ID: {
            type: SequelizeStatic.INTEGER,
            allowNull: false
        },
        AddressTypeID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        AddressLine1: {
            type: SequelizeStatic.STRING(4000),
            allowNull: false
        },
        AddressLine2: {
            type: SequelizeStatic.STRING(4000),
            allowNull: false
        },
        Country: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        Fax: {
            type: SequelizeStatic.STRING(20),
            allowNull: false
        },
        Phone: {
            type: SequelizeStatic.STRING(20),
            allowNull: false
        },
        Phone2: {
            type: SequelizeStatic.STRING(20),
            allowNull: false
        },
        FullName: {
            type: SequelizeStatic.STRING(20),
            allowNull: false
        },
        AddressStartDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        AddressTermDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        Reason: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        CountryID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        Email: {
            type: SequelizeStatic.STRING(200),
            allowNull: false
        }
    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "pvdr",
        tableName: 'Location'
    }
    );
}