import { useState, useEffect, useRef, useCallback } from "react";

const LANG_CONFIG = {
  python:     { label: "Python",     ext: ".py"  },
  javascript: { label: "JavaScript", ext: ".js"  },
  c:          { label: "C",          ext: ".c"   },
  cpp:        { label: "C++",        ext: ".cpp" },
  bash:       { label: "Bash",       ext: ".sh"  },
  go:         { label: "Go",         ext: ".go"  },
};

const DEFAULT_CODE = {
  python:     '# Écris ton code ici\nresultat = input("Entrer un nombre : ")\nprint("Tu as saisi :", resultat)',
  javascript: '// Écris ton code ici\nconsole.log("Hello!");',
  c:          '#include <stdio.h>\n\nint main() {\n    int n;\n    printf("Entrer un nombre : ");\n    scanf("%d", &n);\n    printf("Tu as saisi : %d\\n", n);\n    return 0;\n}',
  cpp:        '#include <iostream>\n\nint main() {\n    int n;\n    std::cout << "Entrer un nombre : ";\n    std::cin >> n;\n    std::cout << "Tu as saisi : " << n << std::endl;\n    return 0;\n}',
  bash:       'echo -n "Entrer un texte : "\nread val\necho "Tu as saisi : $val"',
  go:         'package main\n\nimport "fmt"\n\nfunc main() {\n    var n int\n    fmt.Print("Entrer un nombre : ")\n    fmt.Scan(&n)\n    fmt.Println("Tu as saisi :", n)\n}',
};

// ── Terminal display ──────────────────────────────────────────────────────────
function TerminalDisplay({ lines, inputValue, onInputChange, onInputSubmit, running, inputRef }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, inputValue]);

  return (
    <div
      className="flex-1 bg-[#0A0D13] p-4 font-mono text-[13px] leading-relaxed overflow-y-auto cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) => (
        <div key={i} className={
          line.type === "stderr" || line.type === "error" ? "text-red-400 whitespace-pre-wrap" :
          line.type === "system" ? "text-gray-600 whitespace-pre-wrap" :
          line.type === "stdin"  ? "text-yellow-300 whitespace-pre-wrap" :
          "text-gray-200 whitespace-pre-wrap"
        }>
          {line.data}
        </div>
      ))}

      {/* Input line */}
      {running && (
        <div className="flex items-center text-yellow-300">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") onInputSubmit();
            }}
            autoFocus
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            className="bg-transparent outline-none flex-1 text-yellow-300 caret-yellow-300 font-mono text-[13px]"
            placeholder="Entrer une valeur..."
          />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Main Terminal component ───────────────────────────────────────────────────
export default function Terminal({ langages, collapsible = true, initialCode }) {
  const available = Object.keys(LANG_CONFIG).filter(l => langages.includes(l));
  const firstLang = available[0] || "python";

  const [lang, setLang]         = useState(firstLang);
  const [code, setCode]         = useState(initialCode || DEFAULT_CODE[firstLang]);
  const [lines, setLines]       = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [running, setRunning]   = useState(false);
  const [open, setOpen]         = useState(!collapsible);

  const wsRef    = useRef(null);
  const inputRef = useRef(null);

  const addLine = (type, data) => setLines(l => [...l, { type, data }]);

  const connectAndRun = useCallback(() => {
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setLines([{ type: "system", data: `▶ Exécution en ${LANG_CONFIG[lang]?.label || lang}...\n` }]);
    setRunning(true);
    setInputVal("");

    const ws = new WebSocket("ws://localhost:5001/ws/run");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "run", language: lang, code }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "stdout") addLine("stdout", msg.data);
      if (msg.type === "stderr") addLine("stderr", msg.data);
      if (msg.type === "error")  addLine("error",  msg.data);
      if (msg.type === "exit") {
        addLine("system", `\n─── Terminé (exit ${msg.code}) ───`);
        setRunning(false);
        wsRef.current = null;
      }
    };

    ws.onerror = () => {
      addLine("error", "Impossible de se connecter au serveur.");
      setRunning(false);
    };

    ws.onclose = () => {
      if (running) setRunning(false);
    };
  }, [lang, code]);

  const stop = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "kill" }));
    }
  };

  const submitInput = () => {
    if (!wsRef.current || !inputVal) return;
    const toSend = inputVal + "\n";
    wsRef.current.send(JSON.stringify({ type: "stdin", data: toSend }));
    addLine("stdin", inputVal + "\n");
    setInputVal("");
  };

  const handleLangChange = (l) => {
    setLang(l);
    setCode(DEFAULT_CODE[l]);
    setLines([]);
    setRunning(false);
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
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

  // Cleanup on unmount
  useEffect(() => () => { if (wsRef.current) wsRef.current.close(); }, []);

  const wrapper = (children) => collapsible ? (
    <div className="mt-10 border border-gray-800 rounded-2xl overflow-hidden shadow-xl bg-[#0F1117]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[#161B22] border-b border-gray-800 hover:bg-[#1c2130] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span className="font-mono text-sm font-semibold text-white">Terminal interactif</span>
          <div className="flex gap-1">
            {available.map(l => (
              <span key={l} className="text-xs font-mono text-gray-500 bg-[#0F1117] border border-gray-700 px-2 py-0.5 rounded">
                {LANG_CONFIG[l]?.label}
              </span>
            ))}
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && children}
    </div>
  ) : (
    <div className="flex flex-col h-full bg-[#0F1117]">{children}</div>
  );

  const inner = (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border-b border-gray-800 shrink-0">
        {available.length > 1 && (
          <div className="flex gap-1 bg-[#0F1117] border border-gray-700 rounded-lg p-0.5">
            {available.map(l => (
              <button key={l} onClick={() => handleLangChange(l)}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors
                  ${lang === l ? "bg-green text-white" : "text-gray-400 hover:text-white"}`}>
                {LANG_CONFIG[l]?.label}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {running && (
            <button onClick={stop}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-mono rounded-lg transition-colors">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
              Stop
            </button>
          )}
          <button onClick={connectAndRun} disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-green hover:bg-green-dark text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50">
            {running
              ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Exécution...</>
              : <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Exécuter</>
            }
          </button>
        </div>
      </div>

      {/* Editor + Terminal split */}
      <div className={`flex ${collapsible ? "flex-col" : "flex-1 overflow-hidden"}`}>

        {/* Code editor */}
        <div className={`flex flex-col border-b border-gray-800 ${collapsible ? "" : "border-b-0 border-r"}`}
          style={collapsible ? {} : { width: "55%" }}>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#161B22] border-b border-gray-800 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green/60" />
            </div>
            <span className="text-xs font-mono text-gray-500 ml-1">
              main{LANG_CONFIG[lang]?.ext}
            </span>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            rows={collapsible ? 14 : undefined}
            className={`w-full bg-[#0F1117] text-green font-mono text-[13px] leading-relaxed p-4 resize-y focus:outline-none
              ${collapsible ? "" : "flex-1 resize-none"}`}
          />
        </div>

        {/* Terminal output */}
        <div className={`flex flex-col ${collapsible ? "border-t border-gray-800" : ""}`}
          style={collapsible ? { minHeight: "160px" } : { width: "45%" }}>
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#161B22] border-b border-gray-800 shrink-0">
            <span className="text-xs font-mono text-gray-500">terminal</span>
            {lines.length > 0 && !running && (
              <button onClick={() => setLines([])}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                effacer
              </button>
            )}
          </div>
          <TerminalDisplay
            lines={lines}
            inputValue={inputVal}
            onInputChange={setInputVal}
            onInputSubmit={submitInput}
            running={running}
            inputRef={inputRef}
          />
        </div>
      </div>
    </>
  );

  return wrapper(inner);
}
