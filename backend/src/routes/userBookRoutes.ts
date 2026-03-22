import express from "express";

import * as authController from "../controllers/authController.js";
import * as userBookController from "../controllers/userBookController.js";

const router = express.Router();

// Protect all other routes after this middleware
router.use(authController.protect);

router
  .route("/")
  .post(userBookController.addUserBook)
  .get(userBookController.getAllUserBooks);

router
  .route("/:id")
  .get(userBookController.getUserBook)
  .delete(userBookController.deleteUserBook)
  .patch(userBookController.updateUserBook);

export default router;
