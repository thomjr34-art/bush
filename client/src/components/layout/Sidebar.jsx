import { useState, useEffect } from "react";
import { domaineService, langageService } from "../../services/api.js";

const ICONS = {
  layers: "⬡", code: "{ }", database: "◈", brain: "◎", cpu: "▣",
  globe: "◉", network: "⌥", server: "▤", terminal: "›_", shield: "⬡",
};

export default function Sidebar({ filters, onChange }) {
  const [domaines,  setDomaines]  = useState([]);
  const [langages,  setLangages]  = useState([]);
  const [openCats,  setOpenCats]  = useState({ domaines: true, langages: true, niveau: true });

  useEffect(() => {
    domaineService.getAll().then(({ data }) => setDomaines(data));
    langageService.getAll().then(({ data }) => setLangages(data));
  }, []);

  const toggle = (cat) => setOpenCats(o => ({ ...o, [cat]: !o[cat] }));

  const setFilter = (key, val) => {
    onChange({ ...filters, [key]: filters[key] === val ? "" : val });
  };

  const niveaux = [
    { value: "debutant",      label: "Débutant",      dot: "bg-green" },
    { value: "intermediaire", label: "Intermédiaire", dot: "bg-yellow" },
    { value: "avance",        label: "Avancé",        dot: "bg-red" },
  ];

  return (
    <aside className="w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-white border-r border-gray-100 py-5 px-3">

      {/* Tous les projets */}
      <button
        onClick={() => onChange({})}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-4 transition-colors
          ${!filters.domaine_id && !filters.langage && !filters.niveau
            ? "bg-ink text-white" : "text-gray-500 hover:text-ink hover:bg-gray-50"}`}>
        Tous les projets
      </button>

      {/* ── Domaines ── */}
      <div className="mb-4">
        <button onClick={() => toggle("domaines")}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest hover:text-ink transition-colors">
          <span>Domaines</span>
          <span className={`transition-transform ${openCats.domaines ? "rotate-90" : ""}`}>›</span>
        </button>
        {openCats.domaines && (
          <div className="mt-1 space-y-0.5">
            {domaines.map(d => (
              <button key={d.id} onClick={() => setFilter("domaine_id", d.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                  ${filters.domaine_id === d.id ? "sidebar-active" : "text-gray-600 hover:bg-gray-50 hover:text-ink"}`}>
                <span className="font-mono text-[11px] text-gray-400 w-4 shrink-0">
                  {ICONS[d.icone] || "·"}
                </span>
                <span className="truncate">{d.nom}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 mb-4" />

      {/* ── Langages ── */}
      <div className="mb-4">
        <button onClick={() => toggle("langages")}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest hover:text-ink transition-colors">
          <span>Langages</span>
          <span className={`transition-transform ${openCats.langages ? "rotate-90" : ""}`}>›</span>
        </button>
        {openCats.langages && (
          <div className="mt-1 space-y-0.5">
            {langages.map(l => (
              <button key={l.id} onClick={() => setFilter("langage", l.nom)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                  ${filters.langage === l.nom ? "sidebar-active" : "text-gray-600 hover:bg-gray-50 hover:text-ink"}`}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.couleur }} />
                <span className="font-mono text-xs">{l.nom}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 mb-4" />

      {/* ── Niveau ── */}
      <div>
        <button onClick={() => toggle("niveau")}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest hover:text-ink transition-colors">
          <span>Niveau</span>
          <span className={`transition-transform ${openCats.niveau ? "rotate-90" : ""}`}>›</span>
        </button>
        {openCats.niveau && (
          <div className="mt-1 space-y-0.5">
            {niveaux.map(n => (
              <button key={n.value} onClick={() => setFilter("niveau", n.value)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                  ${filters.niveau === n.value ? "sidebar-active" : "text-gray-600 hover:bg-gray-50 hover:text-ink"}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${n.dot}`} />
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
