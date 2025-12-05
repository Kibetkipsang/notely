BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Notes] ADD [bookmarked_at] DATETIMEOFFSET;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_is_bookmarked_idx] ON [dbo].[Notes]([is_bookmarked]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notes_bookmarked_at_idx] ON [dbo].[Notes]([bookmarked_at]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
