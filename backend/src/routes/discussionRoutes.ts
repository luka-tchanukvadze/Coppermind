import express from "express";

import * as authController from "../controllers/authController.js";
import * as discussionController from "../controllers/discussionController.js";

const router = express.Router();

router.use(authController.protect);

router.route("/").post(discussionController.createDiscussion);

export default router;
