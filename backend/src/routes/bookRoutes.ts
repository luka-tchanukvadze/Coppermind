import express from "express";

import * as authController from "../controllers/authController.js";
import * as bookController from "../controllers/bookController.js";

const router = express.Router();

// Protect all other routes after this middleware
router.use(authController.protect);

router
  .route("/")
  .post(bookController.addBook)
  .get(authController.restrictTo("admin"), bookController.getAllBooks);

export default router;
