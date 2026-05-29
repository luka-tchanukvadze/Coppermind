import { z } from "zod";

// POST /messages/:friendId - sends a chat message in a (possibly new) conversation
export const sendMessageSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  // clientMessageId is the frontend's optimistic uuid - echoed back so the
  // sender's tabs can swap optimistic for real without flashing a duplicate
  clientMessageId: z.uuid().optional(),
});
