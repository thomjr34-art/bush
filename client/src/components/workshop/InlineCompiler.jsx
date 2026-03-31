import { useState, useCallback } from "react";

const ALL_LANGS = [
  { id: "python",     label: "Python",     default: '# Écris ton code Python ici\nprint("Hello!")' },
  { id: "javascript", label: "JavaScript", default: '// Écris ton code JavaScript ici\nconsole.log("Hello!");' },
  { id: "c",          label: "C",          default: '#include <stdio.h>\n\nint main() {\n    printf("Hello!\\n");\n    return 0;\n}' },
  { id: "cpp",        label: "C++",        default: '#include <iostream>\n\nint main() {\n    std::cout << "Hello!" << std::endl;\n    return 0;\n}' },
  { id: "bash",       label: "Bash",       default: 'echo "Hello!"' },
  { id: "go",         label: "Go",         default: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello!")\n}' },
];

async function pistonRun(langId, code) {
  const res = await fetch("http://localhost:5001/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: langId, code }),
  });
  if (!res.ok) throw new Error(`Erreur API (${res.status})`);
  return res.json();
}

// langages = array of lang IDs to allow, e.g. ["python", "javascript"]
export default function InlineCompiler({ langages = ["python", "javascript"] }) {
  const available = ALL_LANGS.filter(l => langages.includes(l.id));
  const initial   = available[0] || ALL_LANGS[0];

  const [lang, setLang]       = useState(initial);
  const [code, setCode]       = useState(initial.default);
  const [output, setOutput]   = useState(null);
  const [running, setRunning] = useState(false);
  const [err, setErr]         = useState("");
  const [open, setOpen]       = useState(false);

  const handleLangChange = (id) => {
    const l = available.find(l => l.id === id);
    setLang(l);
    setCode(l.default);
    setOutput(null);
    setErr("");
  };

  const run = async () => {
    setRunning(true);
    setOutput(null);
    setErr("");
    try {
      const data = await pistonRun(lang.id, code);
      const stdout = data.run?.stdout || "";
      const stderr = data.run?.stderr || "";
      setOutput({ stdout, stderr, code: data.run?.code });
    } catch (e) {
      setErr(e.message || "Erreur de connexion.");
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = e.target.selectionStart;
      const v = e.target.value;
      e.target.value = v.substring(0, s) + "  " + v.substring(e.target.selectionEnd);
      e.target.selectionStart = e.target.selectionEnd = s + 2;
      setCode(e.target.value);
    }
  }, []);

  const outputText = output
    ? (output.stdout || "") + (output.stderr ? `\n[stderr]\n${output.stderr}` : "")
    : null;

  return (
    <div className="mt-10 border border-gray-800 rounded-2xl overflow-hidden shadow-xl bg-[#0F1117]">

      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[#161B22] border-b border-gray-800 hover:bg-[#1c2130] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span className="font-mono text-sm font-semibold text-white">Compilateur intégré</span>
          <div className="flex gap-1">
            {available.map(l => (
              <span key={l.id} className="text-xs font-mono text-gray-500 bg-[#0F1117] border border-gray-700 px-2 py-0.5 rounded">
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Language tabs + run button */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border-b border-gray-800">
            {available.length > 1 && (
              <div className="flex gap-1 bg-[#0F1117] border border-gray-700 rounded-lg p-0.5">
                {available.map(l => (
                  <button key={l.id} onClick={() => handleLangChange(l.id)}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors
                      ${lang.id === l.id ? "bg-green text-white" : "text-gray-400 hover:text-white"}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
            <button onClick={run} disabled={running}
              className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-green hover:bg-green-dark text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50">
              {running
                ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Exécution...</>
                : <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Exécuter</>
              }
            </button>
          </div>

          {/* Editor */}
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            rows={12}
            className="w-full bg-[#0F1117] text-green font-mono text-[13px] leading-relaxed p-4 resize-y focus:outline-none border-b border-gray-800"
          />

          {/* Output */}
          {(outputText || err || running) && (
            <div className="bg-[#0A0D13]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <span className="text-xs font-mono text-gray-500">output</span>
                {output && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${output.code === 0 ? "text-green bg-green/10" : "text-red-400 bg-red-500/10"}`}>
                    exit {output.code}
                  </span>
                )}
              </div>
              <pre className="p-4 text-[13px] font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-auto">
                {err
                  ? <span className="text-red-400">{err}</span>
                  : running
                    ? <span className="text-gray-600">Exécution...</span>
                    : <span className={output?.code !== 0 ? "text-red-400" : "text-gray-200"}>{outputText}</span>
                }
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
