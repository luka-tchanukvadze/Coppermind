import express from "express";
// import * as userController from "./../controllers/userController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.signup);

export default router;
