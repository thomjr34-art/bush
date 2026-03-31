import express  from "express";
import cors     from "cors";
import dotenv   from "dotenv";
import { fileURLToPath } from "url";
import path     from "path";
import http     from "http";
import { WebSocketServer } from "ws";
import { spawn }   from "child_process";
import fs          from "fs";
import os          from "os";
import crypto      from "crypto";

import workshopRoutes from "./routes/workshop.routes.js";
import userRoutes     from "./routes/user.routes.js";
import domaineRoutes  from "./routes/domaine.routes.js";
import langageRoutes  from "./routes/langage.routes.js";
import runRoutes      from "./routes/run.routes.js";

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
app.use("/api/run",       runRoutes);

app.get("/", (_req, res) => res.json({ message: "Bush API 🚀" }));

// ── WebSocket terminal interactif ─────────────────────────────────────────────
const LANG_CONFIG = {
  python:     { ext: ".py",  cmd: "python3", args: (f)        => ["-u", f] },
  javascript: { ext: ".js",  cmd: "node",    args: (f)        => [f] },
  bash:       { ext: ".sh",  cmd: "bash",    args: (f)        => [f] },
  c:          { ext: ".c",   cmd: "sh",      args: (f, out)   => ["-c", `gcc -o ${out} ${f} && ${out}`] },
  cpp:        { ext: ".cpp", cmd: "sh",      args: (f, out)   => ["-c", `g++ -o ${out} ${f} && ${out}`] },
  go:         { ext: ".go",  cmd: "go",      args: (f)        => ["run", f] },
};

const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: "/ws/run" });

wss.on("connection", (ws) => {
  let proc    = null;
  let srcFile = null;
  let outFile = null;

  const cleanup = () => {
    if (proc) { try { proc.kill(); } catch {} proc = null; }
    if (srcFile) { try { fs.unlinkSync(srcFile); } catch {} srcFile = null; }
    if (outFile) { try { fs.unlinkSync(outFile); } catch {} outFile = null; }
  };

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    // { type: "run", language, code }
    if (msg.type === "run") {
      cleanup();

      const config = LANG_CONFIG[msg.language];
      if (!config) {
        ws.send(JSON.stringify({ type: "error", data: `Langage non supporté : ${msg.language}` }));
        return;
      }

      const id  = crypto.randomBytes(8).toString("hex");
      srcFile   = path.join(os.tmpdir(), `run_${id}${config.ext}`);
      outFile   = path.join(os.tmpdir(), `run_${id}_out`);

      fs.writeFileSync(srcFile, msg.code, "utf8");

      proc = spawn(config.cmd, config.args(srcFile, outFile), {
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
      });

      proc.stdout.on("data", (d) => {
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify({ type: "stdout", data: d.toString() }));
      });

      proc.stderr.on("data", (d) => {
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify({ type: "stderr", data: d.toString() }));
      });

      proc.on("close", (code) => {
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify({ type: "exit", code }));
        cleanup();
      });

      proc.on("error", (err) => {
        if (ws.readyState === ws.OPEN)
          ws.send(JSON.stringify({ type: "error", data: err.message }));
        cleanup();
      });
    }

    // { type: "stdin", data: "42\n" }
    if (msg.type === "stdin" && proc) {
      proc.stdin.write(msg.data);
    }

    // { type: "kill" }
    if (msg.type === "kill") {
      cleanup();
      if (ws.readyState === ws.OPEN)
        ws.send(JSON.stringify({ type: "exit", code: -1 }));
    }
  });

  ws.on("close", cleanup);
});

server.listen(PORT, () =>
  console.log(`✅ Bush server running on http://localhost:${PORT}`)
);
