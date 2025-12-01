BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [firstName] VARCHAR(100) NOT NULL,
    [lastName] VARCHAR(100) NOT NULL,
    [userName] VARCHAR(50),
    [emailAddress] VARCHAR(255) NOT NULL,
    [password_hash] VARCHAR(255) NOT NULL,
    [avatarUrl] NVARCHAR(max),
    [createdAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIMEOFFSET NOT NULL CONSTRAINT [Users_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
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
    [is_deleted] BIT NOT NULL CONSTRAINT [Notes_is_deleted_df] DEFAULT 0,
    [deleted_at] DATETIMEOFFSET,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [Notes_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIMEOFFSET NOT NULL CONSTRAINT [Notes_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Notes_pkey] PRIMARY KEY CLUSTERED ([id])
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
CREATE NONCLUSTERED INDEX [Notes_user_id_idx] ON [dbo].[Notes]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_deleted_deleted_at_idx] ON [dbo].[Notes]([is_deleted], [deleted_at]);

-- AddForeignKey
ALTER TABLE [dbo].[Notes] ADD CONSTRAINT [Notes_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
