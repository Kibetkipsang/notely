BEGIN TRY

BEGIN TRAN;

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

-- CreateIndex
CREATE NONCLUSTERED INDEX [UserSettings_user_id_idx] ON [dbo].[UserSettings]([user_id]);

-- AddForeignKey
ALTER TABLE [dbo].[UserSettings] ADD CONSTRAINT [UserSettings_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
