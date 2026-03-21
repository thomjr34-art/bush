import multer from "multer";
import path   from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/pdf/"),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = uuidv4() + ext;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Seuls les fichiers PDF sont acceptés"), false);
};

export const uploadPDF = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max
});
