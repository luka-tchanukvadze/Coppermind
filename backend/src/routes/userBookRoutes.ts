import express from "express";

import * as authController from "../controllers/authController.js";
import * as userBookController from "../controllers/userBookController.js";

const router = express.Router();

// Protect all other routes after this middleware
router.use(authController.protect);

// ─── 1. My Books - CRUD for the logged-in user's book list ───
router
  .route("/")
  .post(userBookController.addUserBook)
  .get(userBookController.getAllUserBooks);

router
  .route("/:id")
  .get(userBookController.getUserBook)
  .delete(userBookController.deleteUserBook)
  .patch(userBookController.updateUserBook);

// ─── 2. Public - view another user's books (private entries hidden) ───
router.get("/user/:userId", userBookController.getPublicUserBooks);

// ─── 3. Custom Data - notes/entries attached to a specific book ───
// :id = userBook ID, :dataId = custom data entry ID
router.route("/:id/custom-data").post(userBookController.addCustomData);

router
  .route("/:id/custom-data/:dataId")
  .get(userBookController.getCustomData)
  .patch(userBookController.updateCustomData)
  .delete(userBookController.deleteCustomData);

export default router;
