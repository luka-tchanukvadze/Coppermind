-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_discussionId_fkey";

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
