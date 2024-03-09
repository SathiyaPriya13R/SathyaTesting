import { UUID } from "crypto";
import { BuildOptions, Model, Sequelize } from "sequelize";
import * as SequelizeStatic from 'sequelize';

export interface AppNotificationRecipientsAttributes {
    AppNotificationID: UUID,
    NotificationDate: Date,
    NotificationContent: string,
    Entity: string,
    ItemID: UUID,
    SendUserType: string,
    AssigneeID: UUID,
    AssignedTo: UUID,
    ProviderClientID:UUID,
    ProviderGroupID:UUID,
    ProviderDoctorID:UUID,
    IsActive: Boolean,
    Status:UUID,
    CreatedDate: Date,
    CreatedBy: UUID,
    ModifiedBy: UUID,
    ModifiedDate: Date,
    RedirectLink:string,
    PracticeManagerID:UUID,
    ProviderUserID:UUID,
    IsActionToken:Boolean,
}

export interface AppNotificationRecipientsModel extends Model<AppNotificationRecipientsAttributes>, AppNotificationRecipientsAttributes { }
export class AppNotificationRecipients extends Model<AppNotificationRecipientsModel, AppNotificationRecipientsAttributes>{ }

export type AppNotificationRecipientsStatic = typeof Model & {
    new(values?: Record<string, unknown>, options?: BuildOptions): AppNotificationRecipientsModel;
};

export function AppNotificationRecipientsFactory(sequelize: Sequelize): AppNotificationRecipientsStatic {
    return <AppNotificationRecipientsStatic>sequelize.define("AppNotificationRecipients", {
        AppNotificationID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
            primaryKey: true,
        },
        NotificationDate: {
            type: SequelizeStatic.DATE,
            allowNull: false,
        },
        NotificationContent: {
            type: SequelizeStatic.STRING,
            allowNull: false
        },
        Entity: {
            type: SequelizeStatic.STRING,
            allowNull: false,
        },
        ItemID: {
            type: SequelizeStatic.UUID,
            allowNull: false,
        },
        SendingUserType: {
            type: SequelizeStatic.STRING,
            allowNull: false,
        },
        AssigneeID: {
            type: SequelizeStatic.UUID,
            allowNull: true,
        },
        AssignedTo: {
            type: SequelizeStatic.UUID,
            allowNull: true,
        },
        ProviderClientID: {
            type: SequelizeStatic.UUID,
            allowNull: true,
        },
        ProviderGroupID: {
            type: SequelizeStatic.UUID,
            allowNull: true,
        },
        ProviderDoctorID: {
            type: SequelizeStatic.UUID,
            allowNull: true,
        },
        IsActive: {
            type: SequelizeStatic.BOOLEAN,
            allowNull: false
        },
        Status: {
            type: SequelizeStatic.UUID,
            allowNull: false,
        },
        CreatedDate: {
            type: SequelizeStatic.DATE,
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
        ModifiedDate: {
            type: SequelizeStatic.DATE,
            allowNull: false
        },
        RedirectLink:{
            type: SequelizeStatic.STRING,
            allowNull:true,
        },
        PracticeManagerID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        ProviderUserID: {
            type: SequelizeStatic.UUID,
            allowNull: true
        },
        IsActionTaken:{
            type: SequelizeStatic.BOOLEAN,
            allowNull:true
        }

    },
    {
        indexes: [],
        timestamps: false,
        freezeTableName: true,
        schema: "ntf",
        tableName: 'AppNotificationRecipients'
    });
}