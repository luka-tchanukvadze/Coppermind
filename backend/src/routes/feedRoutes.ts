import express from "express";

import * as authController from "../controllers/authController.js";
import * as feedController from "../controllers/feedController.js";

const router = express.Router();

router.use(authController.protect);

router.route("/").get(feedController.getFeed);

export default router;
