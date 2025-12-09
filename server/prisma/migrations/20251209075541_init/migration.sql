BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [firstName] VARCHAR(100) NOT NULL,
    [lastName] VARCHAR(100) NOT NULL,
    [userName] VARCHAR(50) NOT NULL,
    [emailAddress] VARCHAR(255) NOT NULL,
    [password] VARCHAR(255) NOT NULL,
    [avatarUrl] NVARCHAR(max),
    [createdAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Users_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [is_deleted] BIT NOT NULL CONSTRAINT [Users_is_deleted_df] DEFAULT 0,
    [deleted_at] DATETIMEOFFSET,
    [scheduled_for_deletion] DATETIMEOFFSET,
    [password_reset_token] VARCHAR(255),
    [password_reset_expires] DATETIMEOFFSET,
    [email_verified] BIT NOT NULL CONSTRAINT [Users_email_verified_df] DEFAULT 0,
    [email_verification_token] VARCHAR(255),
    [email_verification_expires] DATETIMEOFFSET,
    [last_password_change] DATETIMEOFFSET NOT NULL CONSTRAINT [Users_last_password_change_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_userName_key] UNIQUE NONCLUSTERED ([userName]),
    CONSTRAINT [Users_emailAddress_key] UNIQUE NONCLUSTERED ([emailAddress])
);

-- CreateTable
CREATE TABLE [dbo].[Notes] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [synopsis] NVARCHAR(500),
    [is_pinned] BIT NOT NULL CONSTRAINT [Notes_is_pinned_df] DEFAULT 0,
    [is_favorite] BIT NOT NULL CONSTRAINT [Notes_is_favorite_df] DEFAULT 0,
    [is_bookmarked] BIT NOT NULL CONSTRAINT [Notes_is_bookmarked_df] DEFAULT 0,
    [bookmarked_at] DATETIMEOFFSET,
    [pinned_at] DATETIMEOFFSET,
    [favorited_at] DATETIMEOFFSET,
    [is_deleted] BIT NOT NULL CONSTRAINT [Notes_is_deleted_df] DEFAULT 0,
    [deleted_at] DATETIMEOFFSET,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [Notes_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIMEOFFSET NOT NULL CONSTRAINT [Notes_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Notes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserSettings] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email_notifications] BIT NOT NULL CONSTRAINT [UserSettings_email_notifications_df] DEFAULT 1,
    [dark_mode] BIT NOT NULL CONSTRAINT [UserSettings_dark_mode_df] DEFAULT 0,
    [language] VARCHAR(10) NOT NULL CONSTRAINT [UserSettings_language_df] DEFAULT 'en',
    [timezone] VARCHAR(50) NOT NULL CONSTRAINT [UserSettings_timezone_df] DEFAULT 'UTC',
    [push_notifications] BIT NOT NULL CONSTRAINT [UserSettings_push_notifications_df] DEFAULT 1,
    [sound_enabled] BIT NOT NULL CONSTRAINT [UserSettings_sound_enabled_df] DEFAULT 1,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [UserSettings_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIMEOFFSET NOT NULL CONSTRAINT [UserSettings_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [UserSettings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserSettings_user_id_key] UNIQUE NONCLUSTERED ([user_id])
);

-- CreateTable
CREATE TABLE [dbo].[Activities] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [type] VARCHAR(50) NOT NULL,
    [action] VARCHAR(50) NOT NULL,
    [targetType] VARCHAR(50) NOT NULL,
    [targetId] VARCHAR(255),
    [title] NVARCHAR(255) NOT NULL,
    [message] NVARCHAR(500),
    [data] NVARCHAR(max),
    [read] BIT NOT NULL CONSTRAINT [Activities_read_df] DEFAULT 0,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [Activities_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIMEOFFSET NOT NULL,
    [read_at] DATETIMEOFFSET,
    CONSTRAINT [Activities_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_emailAddress_idx] ON [dbo].[Users]([emailAddress]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_userName_idx] ON [dbo].[Users]([userName]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_lastName_firstName_idx] ON [dbo].[Users]([lastName], [firstName]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_password_reset_token_idx] ON [dbo].[Users]([password_reset_token]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_email_verification_token_idx] ON [dbo].[Users]([email_verification_token]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_is_deleted_idx] ON [dbo].[Users]([is_deleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_scheduled_for_deletion_idx] ON [dbo].[Users]([scheduled_for_deletion]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_is_deleted_deleted_at_idx] ON [dbo].[Users]([is_deleted], [deleted_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_user_id_idx] ON [dbo].[Notes]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_deleted_deleted_at_idx] ON [dbo].[Notes]([is_deleted], [deleted_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_pinned_idx] ON [dbo].[Notes]([is_pinned]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_favorite_idx] ON [dbo].[Notes]([is_favorite]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_pinned_is_favorite_idx] ON [dbo].[Notes]([is_pinned], [is_favorite]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_bookmarked_idx] ON [dbo].[Notes]([is_bookmarked]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_updated_at_idx] ON [dbo].[Notes]([updated_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_pinned_at_idx] ON [dbo].[Notes]([pinned_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_favorited_at_idx] ON [dbo].[Notes]([favorited_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_bookmarked_at_idx] ON [dbo].[Notes]([bookmarked_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [UserSettings_user_id_idx] ON [dbo].[UserSettings]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_user_id_idx] ON [dbo].[Activities]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_user_id_read_idx] ON [dbo].[Activities]([user_id], [read]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_user_id_created_at_idx] ON [dbo].[Activities]([user_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_type_idx] ON [dbo].[Activities]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_targetType_targetId_idx] ON [dbo].[Activities]([targetType], [targetId]);

-- AddForeignKey
ALTER TABLE [dbo].[Notes] ADD CONSTRAINT [Notes_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserSettings] ADD CONSTRAINT [UserSettings_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Activities] ADD CONSTRAINT [Activities_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
