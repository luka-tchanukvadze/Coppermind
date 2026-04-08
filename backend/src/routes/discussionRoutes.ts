import express from "express";

import * as authController from "../controllers/authController.js";
import * as discussionController from "../controllers/discussionController.js";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(discussionController.createDiscussion)
  .get(discussionController.getDiscussions);

router
  .route("/:id")
  .get(discussionController.getDiscussion)
  .patch(discussionController.updateDiscussion)
  .delete(discussionController.deleteDiscussion);

// ---- Comments & Likes ----

router.route("/:id/comments").post(discussionController.addComment);

router
  .route("/:id/comments/:commentId")
  .delete(discussionController.deleteComment);

router.route("/:id/like").post(discussionController.toggleLike);

export default router;
