import { Router } from "express";
import { getAllDomaines, createDomaine } from "../controllers/domaine.controller.js";
const router = Router();
router.get("/",  getAllDomaines);
router.post("/", createDomaine);
export default router;
