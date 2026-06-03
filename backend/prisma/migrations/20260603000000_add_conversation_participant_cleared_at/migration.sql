-- "delete for me": per-participant marker that hides a conversation from one
-- user's list (until a newer message arrives) without affecting the other's
ALTER TABLE "conversation_participants" ADD COLUMN "clearedAt" TIMESTAMP(3);
