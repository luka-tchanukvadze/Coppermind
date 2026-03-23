/*
  Warnings:

  - Added the required column `userBookId` to the `custom_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "custom_data" ADD COLUMN     "userBookId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "custom_data" ADD CONSTRAINT "custom_data_userBookId_fkey" FOREIGN KEY ("userBookId") REFERENCES "user_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
