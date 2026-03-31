import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { workshopService, progressionService } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import WorkshopContent from "../components/workshop/WorkshopContent.jsx";
import CodeBlock from "../components/workshop/CodeBlock.jsx";
import Terminal from "../components/workshop/Terminal.jsx";

const niveauLabel = {
  debutant:      { label: "Débutant",      cls: "bg-green/10 text-green-dark border-green/20" },
  intermediaire: { label: "Intermédiaire", cls: "bg-yellow/10 text-yellow-700 border-yellow/20" },
  avance:        { label: "Avancé",        cls: "bg-red/10 text-red border-red/20" },
};

export default function WorkshopDetail() {
  const { id }              = useParams();
  const { user }            = useAuth();
  const [workshop, setW]    = useState(null);
  const [loading,  setL]    = useState(true);
  const [statut,   setSt]   = useState(null);
  const [saving,   setSav]  = useState(false);
  const [tab,      setTab]  = useState("contenu");

  useEffect(() => {
    workshopService.getById(id).then(({ data }) => setW(data)).finally(() => setL(false));
    if (user) progressionService.get().then(({ data }) => {
      const p = data.find(x => x.workshop_id === id);
      if (p) setSt(p.statut);
    }).catch(() => {});
  }, [id, user]);

  const marquer = async () => {
    if (!user) return;
    setSav(true);
    try { await progressionService.update({ workshop_id: id, statut: "termine" }); setSt("termine"); }
    finally { setSav(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!workshop) return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <p className="text-gray-400 text-lg">Workshop introuvable.</p>
      <Link to="/workshops" className="text-green hover:underline mt-3 inline-block">← Retour</Link>
    </div>
  );

  const n        = niveauLabel[workshop.niveau] || niveauLabel.debutant;
  const hasPdf   = Boolean(workshop.pdf_url);
  const hasEdit  = Boolean(workshop.contenu?.sections?.length);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">

      {/* Table des matières latérale */}
      {hasEdit && workshop.contenu?.sections?.length > 1 && (
        <aside className="hidden lg:block w-52 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-4 border-r border-gray-100 bg-white">
          <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-3">
            Sections
          </p>
          <nav className="space-y-0.5">
            {workshop.contenu.sections.map((s, i) => (
              <a key={i} href={`#section-${i}`}
                className="block px-3 py-1.5 text-xs text-gray-500 hover:text-green hover:bg-green/5 rounded-lg transition-colors truncate">
                <span className="font-mono text-gray-300 mr-1.5">{String(i+1).padStart(2,"0")}</span>
                {s.titre || `Section ${i+1}`}
              </a>
            ))}
          </nav>
        </aside>
      )}

      {/* Contenu principal */}
      <main className="flex-1 max-w-3xl mx-auto px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-mono">
          <Link to="/workshops" className="hover:text-green transition-colors">workshops</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{workshop.titre}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-100">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${n.cls}`}>{n.label}</span>
            {workshop.domaine_nom && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                {workshop.domaine_nom}
              </span>
            )}
            {(workshop.langages || []).map(l => (
              <span key={l} className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-ink text-gray-300">
                {l}
              </span>
            ))}
          </div>
          <h1 className="font-syne font-extrabold text-3xl text-ink leading-tight mb-3">
            {workshop.titre}
          </h1>
          {workshop.description && (
            <p className="text-gray-500 leading-relaxed">{workshop.description}</p>
          )}
          <div className="flex gap-4 mt-4 text-xs text-gray-400 font-mono">
            {workshop.duree_heures && <span>⏱ {workshop.duree_heures}h</span>}
            {workshop.vues > 0    && <span>👁 {workshop.vues} vues</span>}
          </div>
        </div>

        {/* Tabs PDF + Éditeur */}
        {hasPdf && hasEdit && (
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
            {[{key:"contenu",label:"Contenu"},{key:"pdf",label:"PDF"}].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors
                  ${tab===key ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-ink"}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Contenu éditeur */}
        {(!hasPdf || tab==="contenu") && hasEdit && (
          <div>
            {workshop.contenu.sections.map((s, i) => (
              <div key={i} id={`section-${i}`}>
                {i > 0 && <div className="border-t border-gray-100 my-8" />}
                {s.titre && (
                  <h2 className="font-syne font-bold text-xl text-ink mb-4 flex items-center gap-3">
                    <span className="font-mono text-xs text-green bg-green/10 border border-green/20 px-2.5 py-1 rounded-full">
                      {String(i+1).padStart(2,"0")}
                    </span>
                    {s.titre}
                  </h2>
                )}
                {(s.blocs||[]).map((b, j) => {
                  if (b.type === "code") return (
                    <CodeBlock key={j} code={b.contenu} langage={b.langage || "plaintext"} />
                  );
                  if (b.type === "etape") return (
                    <div key={j} className="border-l-[3px] border-green pl-5 py-1 my-6">
                      {b.titre && <h4 className="font-syne font-bold text-base mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-green text-white text-xs flex items-center justify-center">✓</span>
                        {b.titre}
                      </h4>}
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{b.contenu}</p>
                    </div>
                  );
                  if (b.type === "conseil") return (
                    <div key={j} className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 my-4 flex gap-3">
                      <span className="text-lg">💡</span>
                      <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-wrap">{b.contenu}</p>
                    </div>
                  );
                  if (b.type === "avertissement") return (
                    <div key={j} className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 my-4 flex gap-3">
                      <span className="text-lg">⚠️</span>
                      <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-wrap">{b.contenu}</p>
                    </div>
                  );
                  return <p key={j} className="text-gray-700 text-sm leading-relaxed my-3 whitespace-pre-wrap">{b.contenu}</p>;
                })}
              </div>
            ))}
          </div>
        )}

        {/* PDF viewer */}
        {hasPdf && (!hasEdit || tab==="pdf") && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">📄 {workshop.pdf_nom || "Document"}</span>
              <a href={workshop.pdf_url} download target="_blank" rel="noreferrer"
                className="text-xs text-green font-medium flex items-center gap-1 hover:underline">
                ↓ Télécharger
              </a>
            </div>
            <iframe src={workshop.pdf_url} title={workshop.titre} className="w-full" style={{ height: "80vh" }} />
          </div>
        )}

        {!hasPdf && !hasEdit && (
          <div className="text-center py-16 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
            Contenu à venir
          </div>
        )}

        {/* Compilateur intégré */}
        {workshop.contenu?.compilateur?.actif && (
          <Terminal langages={workshop.contenu.compilateur.langages || ["python"]} collapsible={true} />
        )}

        {/* Progression */}
        {user && (
          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {statut === "termine" ? "✅ Workshop terminé" : "Tu as fini ce projet ?"}
            </p>
            {statut !== "termine" && (
              <button onClick={marquer} disabled={saving}
                className="bg-green hover:bg-green-dark text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? "..." : "Marquer comme terminé ✓"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
