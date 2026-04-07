import express from "express";

import * as authController from "../controllers/authController.js";
import * as discussionController from "../controllers/discussionController.js";

const router = express.Router();

router.use(authController.protect);

/*
TODO:
✅ POST / — create a discussion (title, description)
✅ GET / — get all discussions (for a feed/browse page)
GET /:id — get single discussion with its comments and like count
PATCH /:id — update your discussion (ownership check)
DELETE /:id — delete your discussion (ownership check)
POST /:id/comments — add a comment to a discussion
DELETE /:id/comments/:commentId — delete your comment
POST /:id/like — like a discussion (toggle — like if not liked, unlike if already liked)
*/

router
  .route("/")
  .post(discussionController.createDiscussion)
  .get(discussionController.getDiscussions);

export default router;
