import { Router } from "express";
import {
  register, login, getMe,
  updateProgression, getProgression,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",    register);
router.post("/login",       login);
router.get("/me",           authMiddleware, getMe);
router.post("/progression", authMiddleware, updateProgression);
router.get("/progression",  authMiddleware, getProgression);

export default router;
