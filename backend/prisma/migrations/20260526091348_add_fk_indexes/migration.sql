-- CreateIndex
CREATE INDEX "comments_discussionId_createdAt_idx" ON "comments"("discussionId", "createdAt");

-- CreateIndex
CREATE INDEX "conversation_participants_conversationId_idx" ON "conversation_participants"("conversationId");

-- CreateIndex
CREATE INDEX "custom_data_userBookId_idx" ON "custom_data"("userBookId");

-- CreateIndex
CREATE INDEX "friend_connections_addresseeId_idx" ON "friend_connections"("addresseeId");

-- CreateIndex
CREATE INDEX "likes_discussionId_idx" ON "likes"("discussionId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");
