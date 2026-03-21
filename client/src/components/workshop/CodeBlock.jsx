import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

export default function CodeBlock({ code, langage = "plaintext" }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.removeAttribute("data-highlighted");
    hljs.highlightElement(ref.current);
  }, [code, langage]);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800 my-5 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow/70" />
            <div className="w-3 h-3 rounded-full bg-green/70" />
          </div>
          <span className="text-xs font-mono text-gray-500 ml-1">{langage}</span>
        </div>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
          {copied
            ? <><span className="text-green-400">✓</span><span className="text-green-400">Copié !</span></>
            : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copier</>
          }
        </button>
      </div>
      <pre className="!m-0 !rounded-none overflow-x-auto text-[13px] leading-relaxed">
        <code ref={ref} className={`language-${langage}`}>{code}</code>
      </pre>
    </div>
  );
}
