import express from "express";

import * as authController from "../controllers/authController.js";
import * as bookController from "../controllers/bookController.js";
import { validate } from "../utils/validate.js";
import { addBookSchema } from "../schemas/books.js";

const router = express.Router();

// All /books routes require auth. POST is admin-only
router.use(authController.protect);

router
  .route("/")
  .post(
    authController.restrictTo("admin"),
    validate(addBookSchema),
    bookController.addBook,
  )
  .get(bookController.getAllBooks);

router.route("/search").get(bookController.searchBooks);
router.route("/genres").get(bookController.getGenres);

router.route("/:id").get(bookController.getBook);
router.route("/:id/readers").get(bookController.getBookReaders);
router.route("/:id/notes").get(bookController.getBookPublicNotes);
router.route("/:id/discussions").get(bookController.getBookDiscussions);

export default router;
