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

router.route("/search").get(bookController.searchBooks);

router.route("/:id").get(bookController.getBook);
router.route("/:id/readers").get(bookController.getBookReaders);
router.route("/:id/notes").get(bookController.getBookPublicNotes);
router.route("/:id/discussions").get(bookController.getBookDiscussions);

export default router;
