import express from "express";

import * as authController from "../controllers/authController.js";
import * as userBookController from "../controllers/userBookController.js";

const router = express.Router();

// Protect all other routes after this middleware
router.use(authController.protect);

router
  .route("/")
  .post(authController.restrictTo("admin"), userBookController.addUserBook)
  .get(userBookController.getUserBooks);

export default router;
