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

router.get("/user/:userId", userBookController.getPublicUserBooks);

// Custom data nested under a userBook
router
  .route("/:id/custom-data")
  .post(userBookController.addCustomData)
  .get(userBookController.getCustomData);

router
  .route("/:id/custom-data/:dataId")
  .patch(userBookController.updateCustomData)
  .delete(userBookController.deleteCustomData);

export default router;
