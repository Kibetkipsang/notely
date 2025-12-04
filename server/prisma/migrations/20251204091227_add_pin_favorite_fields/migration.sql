BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Notes] ADD [is_favorite] BIT NOT NULL CONSTRAINT [Notes_is_favorite_df] DEFAULT 0,
[is_pinned] BIT NOT NULL CONSTRAINT [Notes_is_pinned_df] DEFAULT 0;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_pinned_idx] ON [dbo].[Notes]([is_pinned]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_favorite_idx] ON [dbo].[Notes]([is_favorite]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_pinned_is_favorite_idx] ON [dbo].[Notes]([is_pinned], [is_favorite]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_updated_at_idx] ON [dbo].[Notes]([updated_at]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
