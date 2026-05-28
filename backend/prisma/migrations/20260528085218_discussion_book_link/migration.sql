-- AlterTable
ALTER TABLE "discussions" ADD COLUMN     "bookId" TEXT;

-- CreateIndex
CREATE INDEX "discussions_bookId_idx" ON "discussions"("bookId");

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;
