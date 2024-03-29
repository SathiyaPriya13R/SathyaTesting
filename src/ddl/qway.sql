/**
* 06-02-2024
* Qway orca cred new tables and columns added for mobile application.
*/


-- For Login 
ALTER TABLE [pvdr].[ProviderDoctor]
    ADD [PasswordHash] /*new_column_name*/ Char /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [pvdr].[ProviderGroupContactDetail]
    ADD [PasswordHash] /*new_column_name*/ Char /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [sec].[User]
    ADD [PwdExpireDate] /*new_column_name*/ DATE /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [sec].[User]
    ADD [ForgotPwd] /*new_column_name*/ BIT /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [pvdr].[ProviderDoctor]
    ADD [PwdExpireDate] /*new_column_name*/ Date /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [pvdr].[ProviderDoctor]
    ADD [ForgotPwd] /*new_column_name*/ BIT /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [pvdr].[ProviderGroupContactDetail]
    ADD [ProfileImage] /*new_column_name*/ IMAGE /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [pvdr].[ProviderGroupContactDetail]
    ADD [ForgotPwd] /*new_column_name*/ BIT /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [pvdr].[ProviderGroupContactDetail]
    ADD [PwdExpireDate] /*new_column_name*/ Date /*new_column_datatype*/ NULL /*new_column_nullability*/
GO

ALTER TABLE [pvdr].[ProviderGroupContactDetail]
    ADD [IsActive] /*new_column_name*/ IMAGE /*new_column_datatype*/ NULL /*new_column_nullability*/
GO
-- End

-- For mobile permissions - table
CREATE TABLE sec.MobilePermissions (
    PermissionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID() NOT NULL,
    PermissionName NVARCHAR(50) NOT NULL,
    PermissionOperation NVARCHAR(50) NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    CreatedBy UNIQUEIDENTIFIER DEFAULT NULL,
    CreatedDate DATETIME DEFAULT GETDATE() NOT NULL,
    UpdatedBy UNIQUEIDENTIFIER DEFAULT NULL,
    UpdatedDate DATETIME DEFAULT GETDATE() NOT NULL,
);

-- For mobile permissions - values
INSERT INTO sec.MobilePermissions ( PermissionName, PermissionOperation, Status, CreatedBy, UpdatedBy )
VALUES 
( 'canview', 'read', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'canedit', 'edit', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'candelete', 'delete', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' );

-- For mobile role permissions - table
CREATE TABLE sec.MobileRolePermissions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID() NOT NULL,
    RoleName NVARCHAR(50) NOT NULL,
    ScreenName NVARCHAR(255) NOT NULL,
    SubScreens NVARCHAR(255) DEFAULT NULL,
    Permissions NVARCHAR(255) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Active' NOT NULL,
    CreatedBy UNIQUEIDENTIFIER DEFAULT NULL,
    CreatedDate DATETIME DEFAULT GETDATE() NOT NULL,
    UpdatedBy UNIQUEIDENTIFIER DEFAULT NULL,
    UpdatedDate DATETIME DEFAULT GETDATE() NOT NULL,
);

-- For mobile role permissions - value
INSERT INTO sec.MobileRolePermissions ( RoleName, ScreenName, SubScreens, Permissions, Status, CreatedBy, UpdatedBy )
VALUES 
( 'Provider', 'dashboard', NULL, '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Provider', 'notifications', '["mymessages","alert"]', '["canview","canedit"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
( 'Provider', 'profile', NULL, '["canview","canedit"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Provider', 'provider', '["providerspeciality","viewplans"]', '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Provider', 'payer', '["payerenrollment","task"]', '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Provider', 'location', NULL, '["canview","canedit"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Provider', 'document', NULL, '["canview","canedit","candelete"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Provider', 'esign', NULL, '["canview","canedit"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Group', 'dashboard', NULL, '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Group', 'notifications', '["mymessages","alert"]', '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Group', 'profile', NULL, '["canview","canedit"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Group', 'provider', '["providerspeciality","viewplans"]', '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Group', 'payer', '["payerenrollment","task"]', '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Group', 'location', NULL, '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Group', 'document', NULL, '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' ),
( 'Group', 'esign', NULL, '["canview"]', 'Active', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000' );

-- For login terms of service and privacy policy - table
CREATE TABLE sec.LoginCms (
    CmsId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID() NOT NULL,
    PageTitle NVARCHAR(50) NOT NULL,
    PageDescription NVARCHAR(MAX) NOT NULL,
    PageUrl NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(10) DEFAULT 'Active' NOT NULL,
    CreatedBy UNIQUEIDENTIFIER DEFAULT NULL,
    CreatedDate DATETIME DEFAULT GETDATE() NOT NULL,
    UpdatedBy UNIQUEIDENTIFIER DEFAULT NULL,
    UpdatedDate DATETIME DEFAULT GETDATE() NOT NULL
);

-- 16-0-2024 For insurance history - followed by user start --
ALTER TABLE pvdr.InsuranceFollowup
ALTER COLUMN ModifiedBy NVARCHAR(128);
-- end --

--01-03-2024 For document soft delete - followed by user start 
ALTER TABLE pvdr.DocumentAttachment
    ADD DocumentSoftDelete /*new_column_name*/
BIT /*new_column_datatype*/
NULL /*new_column_nullability*/
--end--


-- 04-03-2024 For Provider Cron password generation
ALTER TABLE pvdr.ProviderDoctor ADD GenerateCronPassword BIT DEFAULT 0

ALTER TABLE pvdr.ProviderDoctor ADD ForgetPwdCron BIT DEFAULT 0

ALTER TABLE pvdr.ProviderGroupContactDetail ADD GenerateCronPassword BIT DEFAULT 0

ALTER TABLE pvdr.ProviderGroupContactDetail ADD ForgetPwdCron BIT DEFAULT 0
-- End

-- START For notification document ID column
ALTER TABLE ntf.AppNotificationRecipients 
ADD AttachmentID UNIQUEIDENTIFIER DEFAULT NULL;
-- END

-- 12-03-2024 For Saving the mobile device id
ALTER TABLE sec.[User] ADD mobileDeviceID nvarchar(256) DEFAULT null
ALTER TABLE pvdr.ProviderDoctor  ADD mobileDeviceID nvarchar(256) DEFAULT null
ALTER TABLE pvdr.ProviderGroupContactDetail  ADD mobileDeviceID nvarchar(256) DEFAULT null
-- End

-- 17-03-2024 - Start
-- For document
ALTER TABLE pvdr.DocumentAttachment ADD RefAttachmentID UNIQUEIDENTIFIER DEFAULT NULL;
ALTER TABLE pvdr.DocumentAttachment ADD IsRenewed BIT DEFAULT 0;
-- For notification
ALTER TABLE ntf.AppNotificationRecipients ADD NotificationDetailedContent NVARCHAR(2000) DEFAULT NULL;
-- End

-- 20-03-2024 - Start
-- For user theme save
ALTER TABLE pvdr.ProviderDoctor ADD ThemeCode NVARCHAR(200) DEFAULT NULL;
ALTER TABLE pvdr.ProviderGroupContactDetail ADD ThemeCode NVARCHAR(200) DEFAULT NULL;
ALTER TABLE sec.[User] ADD ThemeCode NVARCHAR(200) DEFAULT NULL;
-- End

-- 20-03-2024 - Start
-- For Esign creation
ALTER TABLE pvdr.InsuranceFollowup ADD CornStatus BIT DEFAULT 0;
ALTER TABLE pvdr.EsignFileData ADD EnvelopeID NVARCHAR DEFAULT NULL;
ALTER TABLE pvdr.EsignFileData ADD RecipientViewURL NVARCHAR DEFAULT NULL;
ALTER TABLE pvdr.EsignFileData ADD Esigned BIT DEFAULT 0;
ALTER TABLE pvdr.EsignFileData ADD ESignedDate DATETIME DEFAULT NULL;
ALTER TABLE pvdr.EsignFileData ADD EsignExpireDate DATETIME DEFAULT NULL;
ALTER TABLE pvdr.EsignFileData ADD DocumentLocation NVARCHAR DEFAULT NULL;
ALTER TABLE pvdr.EsignFileData ADD EsignedDocumentLocation NVARCHAR DEFAULT NULL;
ALTER TABLE [ORCACRED PROD].ntf.AppNotificationRecipients ALTER COLUMN RedirectLink nvarchar(16) DEFAULT NULL;
-- End

-- 25-03-2024 - Start
-- For Force Update
CREATE TABLE ref.MobileAppVersion (
    AppVersionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID() NOT NULL,
    AndoridForceUpdateVersion NVARCHAR(50) NOT NULL,
    AndoridCurrentVersion NVARCHAR(MAX) NOT NULL,
    AndoridForceUpdateStatus BIT DEFAULT 0,
    AndoridForceUpdateDate DATETIME DEFAULT GETDATE() NOT NULL,
    AndoridCurrentVersionReleaseDate DATETIME DEFAULT GETDATE() NOT NULL,
    iOSForceUpdateVersion NVARCHAR(50) NOT NULL,
    iOSCurrentVersion NVARCHAR(MAX) NOT NULL,
    iOSForceUpdateStatus BIT DEFAULT 0,
    iOSForceupdateDate DATETIME DEFAULT GETDATE() NOT NULL,
    iOSCurrentVersionReleaseDate DATETIME DEFAULT GETDATE() NOT NULL,
    isLatest BIT DEFAULT 1
);

INSERT
	INTO
	[ORCACRED PROD].[ref].MobileAppVersion (AppVersionId,
	AndoridForceUpdateVersion,
	AndoridCurrentVersion,
	AndoridForceUpdateStatus,
	AndoridForceUpdateDate,
	AndoridCurrentVersionReleaseDate,
	iOSForceUpdateVersion,
	iOSCurrentVersion,
	iOSForceUpdateStatus,
	iOSForceupdateDate,
	iOSCurrentVersionReleaseDate,
	isLatest)
VALUES
	 (N'94505AC4-CCC6-4508-8C14-0005120588AE',
N'0.4',
N'1',
1,
'2024-03-20 12:54:34.800',
'2024-03-25 12:54:34.800',
N'0.3',
N'1.3',
1,
'2024-03-19 12:54:34.800',
'2024-03-25 12:54:34.800',
1);
-- End

--27-03-2024 - Start
--For DoctorLocation
ALTER TABLE pvdr.DoctorLocation ADD AddressTermDate DATETIME DEFAULT NULL;
--End

-- 29-03-2024
-- To change password 60 days once
ALTER TABLE pvdr.ProviderDoctor ADD PasswordExpirationDate DATETIME DEFAULT NULL;
ALTER TABLE pvdr.ProviderGroupContactDetail ADD PasswordExpirationDate DATETIME DEFAULT NULL;
-- End