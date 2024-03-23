import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface UserAttributes {
    Id: string,
    UserId: bigint,
    Email: string,
    EmailConfirmed: boolean,
    PasswordHash: string,
    SecurityStamp: string,
    PhoneNumber: string,
    PhoneNumberConfirmed: boolean,
    TwoFactorEnabled: boolean,
    LockoutEndDateUtc: Date,
    LockoutEnabled: boolean,
    AccessFailedCount: bigint,
    UserName: string,
    FirstName: string,
    Middleinitial: string,
    LastName: string,
    DisplayName: string,
    PasswordExpirationDate: Date,
    CreatedDate: Date,
    ModifiedDate: Date,
    Discriminator: string,
    IsActive: boolean,
    UserRoleID: bigint,
    UserLocationID: bigint,
    BlockLogin: boolean,
    JobTitle: string,
    Department: string,
    ManagerID: string,
    AlternateEmailAddress: string,
    UserType: string,
    ChangeOnFirstLogin: boolean,
    ExternalLoginToken: string,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    IsClientUser: boolean,
    UserTypeId: UUID,
    ProfileImage: Blob,
    AccessAllClients: boolean,
    AccessAllGroups: boolean,
    AccessAllProviders: boolean,
    DatePickerFormat: string,
    DateDisplayFormat: string,
    EnableAppNotifications: boolean,
    EnableEmailNotifications: boolean,
    EnableSMSNotifications: boolean,
    IsUserAlreadyLogedin: boolean,
    ProviderClientID: UUID,
    ProviderGroupID: UUID,
    IsSystem: boolean,
    PwdExpireDate: Date,
    ForgotPwd: boolean,
    mobileDeviceID: string,
    ThemeCode: string
}

export interface UserModel extends Model<UserAttributes>, UserAttributes { }
export class User extends Model<UserModel, UserAttributes>{ }

export type UserStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): UserModel;
};

export function UserFactory(sequelize: Sequelize): UserStatic {
    return <UserStatic>sequelize.define("User", {
        Id: {
            type: SequelizeStatic.STRING(128),
            allowNull: false,
            primaryKey: true,
        },
        UserId: {
            type: SequelizeStatic.INTEGER,
            allowNull: false,
            autoIncrement: true,
        },
        Email: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        EmailConfirmed: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        PasswordHash: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        SecurityStamp: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        PhoneNumber: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        PhoneNumberConfirmed: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        TwoFactorEnabled: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        LockoutEndDateUtc: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        LockoutEnabled: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        AccessFailedCount: {
            type: SequelizeStatic.INTEGER,
            allowNull: false
        },
        UserName: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        FirstName: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        Middleinitial: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        LastName: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        DisplayName: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        PasswordExpirationDate: {
            type: SequelizeStatic.DATE,
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
        Discriminator: {
            type: SequelizeStatic.TEXT,
            allowNull: true
        },
        IsActive: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        UserRoleID: {
            type: SequelizeStatic.INTEGER,
            allowNull: false
        },
        BlockLogin: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        JobTitle: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        Department: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        ManagerID: {
            type: SequelizeStatic.TEXT,
            allowNull: false
        },
        AlternateEmailAddress: {
            type: SequelizeStatic.STRING(255),
            allowNull: false
        },
        UserType: {
            type: SequelizeStatic.STRING(50),
            allowNull: false
        },
        ChangeOnFirstLogin: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        ExternalLoginToken: {
            type: SequelizeStatic.TEXT,
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
        IsClientUser: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        UserTypeId: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        ProfileImage: {
            type: SequelizeStatic.BLOB,
            allowNull: true
        },
        AccessAllClients: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        AccessAllGroups: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        AccessAllProviders: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        DatePickerFormat: {
            type: SequelizeStatic.STRING(200),
            allowNull: false
        },
        DateDisplayFormat: {
            type: SequelizeStatic.STRING(200),
            allowNull: false
        },
        EnableAppNotifications: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        EnableEmailNotifications: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        EnableSMSNotifications: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        IsUserAlreadyLogedin: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        ProviderClientID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: false
        },
        IsSystem: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        PwdExpireDate: {
            type: SequelizeStatic.DATE,
            allowNull: true
        },
        ForgotPwd: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: true
        },
        MobileDeviceID: {
            type: SequelizeStatic.STRING(256),
            allowNull: false
        },
        ThemeCode: {
            type: SequelizeStatic.STRING(200),
            allowNull: true
        }


    },
        {

            indexes: [],
            timestamps: false,
            freezeTableName: true,
            schema: "sec",
            tableName: 'User'
        });

}