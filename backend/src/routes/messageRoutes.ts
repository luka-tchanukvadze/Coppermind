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
router.route("/:conversationId").get(messageController.getConversation);
router
  .route("/:conversationId/:messageId")
  .delete(messageController.unsendMessage);

export default router;
