import { Router } from "express";
import { getAllLangages, createLangage } from "../controllers/langage.controller.js";
const router = Router();
router.get("/",  getAllLangages);
router.post("/", createLangage);
export default router;
