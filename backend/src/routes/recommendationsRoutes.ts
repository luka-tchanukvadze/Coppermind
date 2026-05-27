import express from "express";

import * as authController from "../controllers/authController.js";
import * as recommendationsController from "../controllers/recommendationsController.js";

const router = express.Router();

router.use(authController.protect);

router.route("/").get(recommendationsController.getRecommendations);

export default router;
