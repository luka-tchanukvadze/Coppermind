import express from "express";

import * as authController from "../controllers/authController.js";
import * as bookController from "../controllers/bookController.js";

const router = express.Router();

router.route("/").post(bookController.addBook).get(bookController.getAllBooks);

export default router;
