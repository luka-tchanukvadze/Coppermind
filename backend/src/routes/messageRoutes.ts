import express from "express";

import * as authController from "../controllers/authController.js";
import * as messageController from "../controllers/messageController.js";

const router = express.Router();

router.use(authController.protect);

router.route("/").get(messageController.getConversations);
router.route("/:friendId").post(messageController.sendMessage);
router.route("/:conversationId").get(messageController.getConversation);
router
  .route("/:conversationId/:messageId")
  .delete(messageController.unsendMessage);

export default router;
