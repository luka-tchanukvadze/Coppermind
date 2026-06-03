import express from "express";

import * as authController from "../controllers/authController.js";
import * as messageController from "../controllers/messageController.js";
import { validate } from "../utils/validate.js";
import { sendMessageSchema } from "../schemas/messages.js";

const router = express.Router();

router.use(authController.protect);

router.route("/").get(messageController.getConversations);
router
  .route("/:friendId")
  .post(validate(sendMessageSchema), messageController.sendMessage);
router
  .route("/:conversationId")
  .get(messageController.getConversation)
  // "delete for me" - clears the thread from the caller's list only (the other
  // person keeps theirs). safe next to /:conversationId/:messageId (unsend)
  // because that route has an extra path segment, so methods never collide
  .delete(messageController.deleteConversation);
// literal "/messages" + "/read" - declared before the :messageId param route
// so they can't be swallowed by it
router
  .route("/:conversationId/messages")
  .get(messageController.getOlderMessages);
router
  .route("/:conversationId/read")
  .patch(messageController.markConversationRead);
router
  .route("/:conversationId/:messageId")
  .delete(messageController.unsendMessage);

export default router;
