-- DropForeignKey
ALTER TABLE "custom_data" DROP CONSTRAINT "custom_data_userBookId_fkey";

-- AddForeignKey
ALTER TABLE "custom_data" ADD CONSTRAINT "custom_data_userBookId_fkey" FOREIGN KEY ("userBookId") REFERENCES "user_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
