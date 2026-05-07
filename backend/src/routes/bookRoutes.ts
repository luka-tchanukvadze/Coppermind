import express from "express";

import * as authController from "../controllers/authController.js";
import * as bookController from "../controllers/bookController.js";

const router = express.Router();

// All /books routes require auth. POST is admin-only
router.use(authController.protect);

router
  .route("/")
  .post(authController.restrictTo("admin"), bookController.addBook)
  .get(bookController.getAllBooks);

export default router;
