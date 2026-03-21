import { Router }    from "express";
import { uploadPDF } from "../config/upload.js";
import {
  getAllWorkshops, getWorkshopById,
  createWorkshop,  updateWorkshop,
  togglePublier,   deleteWorkshop,
} from "../controllers/workshop.controller.js";

const router = Router();
router.get("/",              getAllWorkshops);
router.get("/:id",           getWorkshopById);
router.post("/",             uploadPDF.single("pdf"), createWorkshop);
router.put("/:id",           uploadPDF.single("pdf"), updateWorkshop);
router.patch("/:id/publier", togglePublier);
router.delete("/:id",        deleteWorkshop);
export default router;
