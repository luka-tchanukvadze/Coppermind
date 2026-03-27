import express from "express";

import * as authController from "../controllers/authController.js";
import * as friendController from "../controllers/friendController.js";

const router = express.Router();

router.use(authController.protect);

router.route("/");

export default router;
