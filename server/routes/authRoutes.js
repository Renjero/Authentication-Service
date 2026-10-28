import express from "express";
import authControllerService from "../auth/authController.js";

const router = express.Router();

router.post("/register", authControllerService.registerUser);
// 
router.post("/get-me", authControllerService.getMyProfile);

// router.post("/login", authControllerService.login);
// 
// router.get("/refresh-token", authControllerService.refreshToken)
// 
// router.get("/logout", authControllerService.logout)

export default router;

// http://localhost:8080