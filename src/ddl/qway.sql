/**
* 06-02-2024
* Qway orca cred new tables and columns added for mobile application.
*/


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