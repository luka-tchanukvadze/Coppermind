import express from "express";

import * as authController from "../controllers/authController.js";
import * as messageController from "../controllers/messageController.js";

const router = express.Router();

router.use(authController.protect);

/*
TODO:
-✅ Send message to a friend - POST /:friendId (if no conversation exists, create one automatically)
-✅ Get all my conversations - GET /
-✅ Get single conversation with messages - GET /:conversationId
- Delete my message - DELETE /:conversationId/:messageId
*/

router.route("/").get(messageController.getConversations);
router.route("/:friendId").post(messageController.sendMessage);
router.route("/:conversationId").get(messageController.getConversation);

export default router;
