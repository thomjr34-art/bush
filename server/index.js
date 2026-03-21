import express  from "express";
import cors     from "cors";
import dotenv   from "dotenv";
import { fileURLToPath } from "url";
import path     from "path";

import workshopRoutes from "./routes/workshop.routes.js";
import userRoutes     from "./routes/user.routes.js";
import domaineRoutes  from "./routes/domaine.routes.js";
import langageRoutes  from "./routes/langage.routes.js";

dotenv.config();

const app       = express();
const PORT      = process.env.PORT || 5001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/workshops", workshopRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/domaines",  domaineRoutes);
app.use("/api/langages",  langageRoutes);

app.get("/", (_req, res) => res.json({ message: "Bush API 🚀" }));

app.listen(PORT, () =>
  console.log(`✅ Bush server running on http://localhost:${PORT}`)
);
