import express from "express";
import * as userController from "./../controllers/userController.js";
import * as authController from "../controllers/authController.js";
import { validate } from "../utils/validate.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "../schemas/auth.js";
import { updateMeSchema } from "../schemas/users.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post(
  "/forgotPassword",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.patch(
  "/resetPassword/:token",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// Protect all other routes after this middleware
router.use(authController.protect);

router.patch(
  "/updateMyPassword",
  validate(updatePasswordSchema),
  authController.updatePassword,
);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", validate(updateMeSchema), userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

// Restricting to all other routes after this middleware
// router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .delete(authController.restrictTo("admin"), userController.deleteUserById);
router.route("/:id/profile-stats").get(userController.getUserProfileStats);
router.route("/:id/discussions").get(userController.getUserDiscussions);
router.route("/:id/notes").get(userController.getUserPublicNotes);

export default router;
