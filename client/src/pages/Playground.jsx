import Terminal from "../components/workshop/Terminal.jsx";

const ALL_LANGS = ["python", "javascript", "c", "cpp", "bash", "go"];

export default function Playground() {
  return (
    <div className="flex flex-col bg-[#0F1117]" style={{ height: "calc(100vh - 3.5rem)" }}>
      <div className="flex items-center gap-3 px-5 py-3 bg-[#161B22] border-b border-gray-800 shrink-0">
        <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
        <span className="font-syne font-bold text-white text-sm tracking-tight">Playground</span>
        <span className="text-gray-600 text-xs font-mono">— exécution interactive</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Terminal langages={ALL_LANGS} collapsible={false} />
      </div>
    </div>
  );
}
