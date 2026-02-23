import express from "express";
// import * as userController from "./../controllers/userController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protect all other routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

export default router;
