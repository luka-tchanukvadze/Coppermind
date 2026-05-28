import express from "express";
import * as userController from "./../controllers/userController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all other routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);
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
