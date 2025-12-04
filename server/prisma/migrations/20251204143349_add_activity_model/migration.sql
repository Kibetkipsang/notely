BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Notes] ADD [favorited_at] DATETIMEOFFSET,
[pinned_at] DATETIMEOFFSET;

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
CREATE NONCLUSTERED INDEX [Activities_user_id_idx] ON [dbo].[Activities]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_user_id_read_idx] ON [dbo].[Activities]([user_id], [read]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_user_id_created_at_idx] ON [dbo].[Activities]([user_id], [created_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_type_idx] ON [dbo].[Activities]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activities_targetType_targetId_idx] ON [dbo].[Activities]([targetType], [targetId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_pinned_at_idx] ON [dbo].[Notes]([pinned_at]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_favorited_at_idx] ON [dbo].[Notes]([favorited_at]);

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
