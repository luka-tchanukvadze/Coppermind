import express from "express";

import * as authController from "../controllers/authController.js";
import * as friendController from "../controllers/friendController.js";

const router = express.Router();

router.use(authController.protect);

// ─── Static routes first (before :friendId catches them) ───
router.route("/").get(friendController.getFriends);
router.route("/requests").get(friendController.getIncomingRequests);
router.route("/mutual/:friendId").get(friendController.getMutualFriends);

// ─── :friendId routes - send, remove, accept ───
router
  .route("/:friendId")
  .post(friendController.sendRequest)
  .delete(friendController.removeConnection);

router.route("/:friendId/accept").patch(friendController.acceptRequest);

export default router;
