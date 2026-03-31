import { Router }  from "express";
import { spawn }   from "child_process";
import fs          from "fs";
import path        from "path";
import os          from "os";
import crypto      from "crypto";

const router = Router();

const LANG_CONFIG = {
  python:     { ext: ".py",   cmd: "python3",  args: (f) => [f] },
  javascript: { ext: ".js",   cmd: "node",     args: (f) => [f] },
  bash:       { ext: ".sh",   cmd: "bash",     args: (f) => [f] },
  c:          { ext: ".c",    cmd: "sh",       args: (f, out) => ["-c", `gcc -o ${out} ${f} && ${out}`] },
  cpp:        { ext: ".cpp",  cmd: "sh",       args: (f, out) => ["-c", `g++ -o ${out} ${f} && ${out}`] },
  go:         { ext: ".go",   cmd: "go",       args: (f) => ["run", f] },
};

const TIMEOUT_MS = 10_000;

router.post("/", (req, res) => {
  const { language, code } = req.body;

  if (!language || code === undefined)
    return res.status(400).json({ error: "language et code sont requis" });

  const config = LANG_CONFIG[language];
  if (!config)
    return res.status(400).json({ error: `Langage non supporté : ${language}` });

  const id      = crypto.randomBytes(8).toString("hex");
  const tmpDir  = os.tmpdir();
  const srcFile = path.join(tmpDir, `run_${id}${config.ext}`);
  const outFile = path.join(tmpDir, `run_${id}_out`);

  fs.writeFileSync(srcFile, code, "utf8");

  const args    = config.args(srcFile, outFile);
  const proc    = spawn(config.cmd, args, { timeout: TIMEOUT_MS });

  let stdout = "";
  let stderr = "";

  proc.stdout.on("data", d => { stdout += d.toString(); });
  proc.stderr.on("data", d => { stderr += d.toString(); });

  proc.on("close", (code) => {
    // Cleanup temp files
    try { fs.unlinkSync(srcFile); } catch {}
    try { fs.unlinkSync(outFile); } catch {}

    res.json({ run: { stdout, stderr, code } });
  });

  proc.on("error", (err) => {
    try { fs.unlinkSync(srcFile); } catch {}
    try { fs.unlinkSync(outFile); } catch {}
    res.status(500).json({ error: err.message });
  });
});

export default router;
