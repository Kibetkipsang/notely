BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[AIChats] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(255),
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [AIChats_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIMEOFFSET NOT NULL,
    CONSTRAINT [AIChats_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AIMessages] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [chat_id] UNIQUEIDENTIFIER NOT NULL,
    [role] VARCHAR(20) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [AIMessages_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AIMessages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AIUsage] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [endpoint] VARCHAR(100) NOT NULL,
    [tokens] INT NOT NULL,
    [cost] DECIMAL(10,4) NOT NULL,
    [metadata] NVARCHAR(max),
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [AIUsage_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AIUsage_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AIChats_user_id_idx] ON [dbo].[AIChats]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AIChats_user_id_created_at_idx] ON [dbo].[AIChats]([user_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AIMessages_chat_id_idx] ON [dbo].[AIMessages]([chat_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AIMessages_chat_id_created_at_idx] ON [dbo].[AIMessages]([chat_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AIMessages_role_idx] ON [dbo].[AIMessages]([role]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AIUsage_user_id_idx] ON [dbo].[AIUsage]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AIUsage_user_id_created_at_idx] ON [dbo].[AIUsage]([user_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AIUsage_endpoint_idx] ON [dbo].[AIUsage]([endpoint]);

-- AddForeignKey
ALTER TABLE [dbo].[AIChats] ADD CONSTRAINT [AIChats_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AIMessages] ADD CONSTRAINT [AIMessages_chat_id_fkey] FOREIGN KEY ([chat_id]) REFERENCES [dbo].[AIChats]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AIUsage] ADD CONSTRAINT [AIUsage_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
