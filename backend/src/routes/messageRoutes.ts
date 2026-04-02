import express from "express";

import * as authController from "../controllers/authController.js";
import * as messageController from "../controllers/messageController.js";

const router = express.Router();

router.use(authController.protect);

/*
TODO:
- Send message to a friend - POST /:friendId (if no conversation exists, create one automatically)
- Get all my conversations - GET /
- Get single conversation with messages - GET /:conversationId
- Delete my message - DELETE /:conversationId/:messageId
*/

export default router;
