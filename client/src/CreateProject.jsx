import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { workshopService, domaineService, langageService } from "../services/api.js";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

// ─── Coloration syntaxique live dans la textarea ────────────────────────────
function CodeEditor({ value, langage, onChange }) {
  const preRef = useRef(null);
  const taRef  = useRef(null);
  const highlighted = hljs.highlight(value || "", {
    language: hljs.getLanguage(langage) ? langage : "plaintext",
    ignoreIllegals: true,
  }).value;

  const syncScroll = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop  = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  return (
    <div style={{ position: "relative", fontFamily: "monospace" }}>
      <pre
        ref={preRef}
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          margin: 0, padding: "12px 14px", fontSize: "13px", lineHeight: "1.6",
          background: "#0F1117", borderRadius: 0, overflow: "hidden",
          pointerEvents: "none", whiteSpace: "pre-wrap", wordBreak: "break-all",
          tabSize: 2,
        }}
        dangerouslySetInnerHTML={{ __html: highlighted + "\n" }}
      />
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        style={{
          position: "relative", display: "block", width: "100%", minHeight: "180px",
          padding: "12px 14px", fontSize: "13px", lineHeight: "1.6",
          fontFamily: "'Space Mono', monospace", background: "transparent",
          color: "transparent", caretColor: "#fff", border: "none", outline: "none",
          resize: "vertical", tabSize: 2, whiteSpace: "pre-wrap",
          wordBreak: "break-all", zIndex: 1,
        }}
      />
    </div>
  );
}

const LANGS = ["bash","c","cpp","python","javascript","typescript","java","go","rust","sql","plaintext"];
const BLOC_TYPES = [
  { value: "texte",         label: "Texte"    },
  { value: "code",          label: "Code"     },
  { value: "etape",         label: "Étape"    },
  { value: "conseil",       label: "Conseil"  },
  { value: "avertissement", label: "Attention"},
];

function BlocEditor({ bloc, index, onChange, onDelete }) {
  const typeStyle = {
    texte:         "bg-gray-100 text-gray-600 border-gray-200",
    code:          "bg-[#0F1117] text-green border-[#2C2F3A]",
    etape:         "bg-green/10 text-green-dark border-green/30",
    conseil:       "bg-blue-50 text-blue-700 border-blue-200",
    avertissement: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <div className="group border border-gray-100 rounded-xl overflow-hidden mb-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${typeStyle[bloc.type]}`}>
          {BLOC_TYPES.find(t => t.value === bloc.type)?.label}
        </span>
        <select value={bloc.type} onChange={e => onChange({ ...bloc, type: e.target.value, contenu: "" })}
          className="text-[11px] border border-gray-200 rounded px-2 py-0.5 bg-white text-gray-500 focus:outline-none">
          {BLOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {bloc.type === "code" && (
          <select value={bloc.langage || "python"} onChange={e => onChange({ ...bloc, langage: e.target.value })}
            className="text-[11px] border border-[#2C2F3A] rounded px-2 py-0.5 bg-[#0F1117] text-green focus:outline-none">
            {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
        <button onClick={onDelete}
          className="ml-auto text-[11px] text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
          × suppr.
        </button>
      </div>
      {bloc.type === "etape" && (
        <div className="px-4 pt-3 bg-white">
          <input value={bloc.titre || ""} onChange={e => onChange({ ...bloc, titre: e.target.value })}
            placeholder="Titre de l'étape (ex: Étape 1 — Écrire le lexer)"
            className="w-full text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2 focus:outline-none focus:border-green/50 placeholder:text-gray-300 bg-transparent"/>
        </div>
      )}
      {bloc.type === "code" ? (
        <CodeEditor value={bloc.contenu || ""} langage={bloc.langage || "python"} onChange={v => onChange({ ...bloc, contenu: v })}/>
      ) : (
        <textarea value={bloc.contenu || ""} onChange={e => onChange({ ...bloc, contenu: e.target.value })}
          placeholder={
            bloc.type === "etape"         ? "Décris cette étape en détail..." :
            bloc.type === "conseil"       ? "Partage une astuce ou bonne pratique..." :
            bloc.type === "avertissement" ? "Signale un piège ou erreur fréquente..." :
            "Écris ton texte explicatif ici..."}
          rows={4}
          className={`w-full px-4 py-3 text-sm resize-y focus:outline-none leading-relaxed
            ${bloc.type === "conseil"       ? "bg-blue-50 text-blue-800 placeholder:text-blue-200"    : ""}
            ${bloc.type === "avertissement" ? "bg-amber-50 text-amber-800 placeholder:text-amber-200"  : ""}
            ${["texte","etape"].includes(bloc.type) ? "bg-white text-gray-700 placeholder:text-gray-300" : ""}`}
        />
      )}
    </div>
  );
}

function SectionEditor({ section, index, onChange, onDelete }) {
  const addBloc = (type) => onChange({
    ...section,
    blocs: [...(section.blocs || []), { id: Date.now(), type, contenu: "", langage: "python", titre: "" }],
  });
  return (
    <div className="border-2 border-gray-100 rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="w-6 h-6 rounded-full bg-[#0F1117] text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </div>
        <input value={section.titre || ""} onChange={e => onChange({ ...section, titre: e.target.value })}
          placeholder="Titre de la section (ex: Introduction, Le Lexer, Parsing...)"
          className="flex-1 text-sm font-semibold bg-transparent border-b-2 border-transparent focus:border-green/50 focus:outline-none placeholder:text-gray-300 pb-0.5 text-gray-800"/>
        <button onClick={onDelete} className="text-xs text-gray-300 hover:text-red-500 transition-colors shrink-0">
          Supprimer
        </button>
      </div>
      <div className="p-4 bg-white">
        {(section.blocs || []).length === 0
          ? <p className="text-xs text-gray-300 text-center py-4">Ajoute un premier bloc ci-dessous</p>
          : (section.blocs || []).map((bloc, i) => (
              <BlocEditor key={bloc.id || i} bloc={bloc} index={i}
                onChange={u => { const b=[...section.blocs]; b[i]=u; onChange({...section,blocs:b}); }}
                onDelete={() => onChange({ ...section, blocs: section.blocs.filter((_,j)=>j!==i) })}/>
            ))
        }
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { type:"etape",         label:"+ Étape",    cls:"border-green/30 text-green-dark bg-green/5 hover:bg-green/10" },
            { type:"texte",         label:"+ Texte",    cls:"border-gray-200 text-gray-600 bg-white hover:bg-gray-50" },
            { type:"code",          label:"+ Code",     cls:"border-[#2C2F3A] text-green bg-[#0F1117] hover:bg-[#1a1f2e]" },
            { type:"conseil",       label:"+ Conseil",  cls:"border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100" },
            { type:"avertissement", label:"+ Attention",cls:"border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100" },
          ].map(({ type, label, cls }) => (
            <button key={type} onClick={() => addBloc(type)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${cls}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CreateProject() {
  // MOCK USER : Simulation d'un admin connecté
  const user = {
    id: "admin-mock-id",
    nom: "Admin",
    role: "admin"
  };
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const [step,     setStep]     = useState(1);
  const [form,     setForm]     = useState({ titre:"", description:"", niveau:"debutant", langages:[], domaine_id:"", duree_heures:2 });
  const [sections, setSections] = useState([]);
  const [pdfFile,  setPdfFile]  = useState(null);
  const [mode,     setMode]     = useState("editeur");
  const [domaines, setDomaines] = useState([]);
  const [langages, setLangages] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    domaineService.getAll().then(({ data }) => setDomaines(data));
    langageService.getAll().then(({ data }) => setLangages(data));
  }, []);

  const toggleLang = (nom) => setForm(f => ({ ...f, langages: f.langages.includes(nom) ? f.langages.filter(l=>l!==nom) : [...f.langages, nom] }));
  const addSection = () => setSections(s => [...s, { id: Date.now(), titre: "", blocs: [] }]);

  const goNext = () => {
    if (step === 1 && !form.titre.trim()) { setError("Le titre est obligatoire."); return; }
    setError(""); setStep(s => s + 1);
  };

  const handleSave = async (publie) => {
    if (!form.titre.trim()) { setError("Le titre est obligatoire."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("titre",        form.titre.trim());
      fd.append("description",  form.description.trim());
      fd.append("niveau",       form.niveau);
      fd.append("langages",     JSON.stringify(form.langages));
      fd.append("domaine_id",   form.domaine_id);
      fd.append("duree_heures", form.duree_heures);
      fd.append("publie",       (user.role === "admin" && publie).toString());
      if ((mode==="editeur"||mode==="les-deux") && sections.length > 0)
        fd.append("contenu", JSON.stringify({ sections }));
      if (pdfFile) fd.append("pdf", pdfFile);
      await workshopService.create(fd);
      navigate("/workshops");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la sauvegarde.");
    } finally { setSaving(false); }
  };

  const totalBlocs   = sections.reduce((acc, s) => acc + (s.blocs?.length || 0), 0);
  const domaineLabel = domaines.find(d => d.id === form.domaine_id)?.nom || "—";

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-100 py-6 px-4 flex flex-col">
        <div className="flex items-center gap-2.5 mb-6" title="Bush">
          <div className="w-7 h-7 bg-ink rounded-lg flex items-center justify-center">
            <span className="text-white font-mono font-bold text-lg">B</span>
          </div>
          <span className="font-syne font-bold text-sm text-ink">Nouveau projet</span>
        </div>
        <nav className="space-y-1">
          {[{n:1,label:"Informations"},{n:2,label:"Contenu"},{n:3,label:"Publier"}].map(({ n, label }) => (
            <button key={n} onClick={() => n < step ? setStep(n) : null}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left
                ${step===n ? "bg-ink text-white font-medium" : n<step ? "text-gray-500 hover:bg-gray-50 cursor-pointer" : "text-gray-300 cursor-default"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0
                ${step===n ? "bg-white text-ink" : n<step ? "bg-green text-white" : "bg-gray-200 text-gray-400"}`}>
                {n < step ? "✓" : n}
              </span>
              {label}
            </button>
          ))}
        </nav>
        {form.titre && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">Aperçu</p>
            <p className="text-xs font-semibold text-gray-700 line-clamp-2">{form.titre}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {form.langages.slice(0,3).map(l => (
                <span key={l} className="font-mono text-[9px] bg-ink text-gray-300 px-1.5 py-0.5 rounded">{l}</span>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 max-w-3xl mx-auto px-8 py-8">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h1 className="font-syne font-extrabold text-2xl text-ink mb-1">Informations du projet</h1>
              <p className="text-gray-400 text-sm">Définis le contexte, le domaine et le public cible.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Titre du projet *</label>
                <input value={form.titre} onChange={e => setForm(f=>({...f,titre:e.target.value}))}
                  placeholder="Ex: Écrire un compilateur C de zéro"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 placeholder:text-gray-300"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                  placeholder="Ce que l'étudiant va construire et apprendre..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green/30 placeholder:text-gray-300"/>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Domaine</label>
                  <select value={form.domaine_id} onChange={e => setForm(f=>({...f,domaine_id:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30">
                    <option value="">— Choisir —</option>
                    {domaines.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Niveau</label>
                  <select value={form.niveau} onChange={e => setForm(f=>({...f,niveau:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30">
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Durée (h)</label>
                  <input type="number" min={1} value={form.duree_heures}
                    onChange={e => setForm(f=>({...f,duree_heures:parseInt(e.target.value)||1}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Langages</label>
                <div className="flex flex-wrap gap-2">
                  {langages.map(l => (
                    <button key={l.id} type="button" onClick={() => toggleLang(l.nom)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${form.langages.includes(l.nom) ? "bg-ink text-white border-ink" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.couleur }}/>
                      {l.nom}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Format du contenu</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{v:"editeur",label:"Éditeur",icon:"✏️",desc:"Rédige ici"},{v:"pdf",label:"PDF",icon:"📄",desc:"Upload un PDF"},{v:"les-deux",label:"Les deux",icon:"⚡",desc:"Éditeur + PDF"}].map(({ v, label, icon, desc }) => (
                    <button key={v} type="button" onClick={() => setMode(v)}
                      className={`p-3 rounded-xl border text-left transition-all ${mode===v ? "border-green bg-green/5" : "border-gray-100 hover:border-gray-200 bg-white"}`}>
                      <p className="text-base mb-0.5">{icon}</p>
                      <p className={`text-xs font-semibold ${mode===v ? "text-green-dark" : "text-ink"}`}>{label}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">{error}</p>}
            <div className="flex justify-end mt-5">
              <button onClick={goNext} className="bg-green hover:bg-green-dark text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
                Suivant → Contenu
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h1 className="font-syne font-extrabold text-2xl text-ink mb-1">Contenu du projet</h1>
              <p className="text-gray-400 text-sm">Organise en sections. Ajoute texte, étapes guidées, blocs de code colorés...</p>
            </div>
            {(mode==="pdf"||mode==="les-deux") && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Fichier PDF</p>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green/40 hover:bg-green/5 transition-colors">
                  {pdfFile
                    ? <p className="text-sm text-green font-medium">📄 {pdfFile.name}</p>
                    : <><p className="text-2xl mb-2">📤</p><p className="text-gray-400 text-sm">Clique pour uploader un PDF</p><p className="text-gray-300 text-xs mt-1">Max 50 Mo</p></>
                  }
                </div>
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => setPdfFile(e.target.files[0]||null)}/>
              </div>
            )}
            {(mode==="editeur"||mode==="les-deux") && (
              <div>
                {sections.length === 0
                  ? <div onClick={addSection}
                      className="border-2 border-dashed border-gray-200 rounded-2xl p-14 text-center cursor-pointer hover:border-green/30 hover:bg-green/5 transition-colors mb-4">
                      <p className="font-syne font-bold text-xl text-gray-200 mb-1">Aucune section</p>
                      <p className="text-sm text-gray-400">Clique pour créer la première section</p>
                    </div>
                  : sections.map((s, i) => (
                      <SectionEditor key={s.id||i} section={s} index={i}
                        onChange={u => { const a=[...sections]; a[i]=u; setSections(a); }}
                        onDelete={() => setSections(sections.filter((_,j)=>j!==i))}/>
                    ))
                }
                <button onClick={addSection}
                  className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-green/30 hover:text-green text-sm font-medium transition-colors">
                  + Nouvelle section
                </button>
              </div>
            )}
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">← Retour</button>
              <button onClick={() => { setError(""); setStep(3); }} className="bg-green hover:bg-green-dark text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">Suivant → Publier</button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <h1 className="font-syne font-extrabold text-2xl text-ink mb-1">Prêt à publier</h1>
              <p className="text-gray-400 text-sm">Vérifie le récapitulatif avant de mettre le projet en ligne.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Récapitulatif</p>
              <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                <span className="text-gray-400">Titre</span>   <span className="font-medium text-ink">{form.titre||"—"}</span>
                <span className="text-gray-400">Domaine</span> <span>{domaineLabel}</span>
                <span className="text-gray-400">Durée</span>   <span>{form.duree_heures}h</span>
                <span className="text-gray-400">Niveau</span>
                <span><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${form.niveau==="debutant"?"bg-green/10 text-green-dark":form.niveau==="intermediaire"?"bg-yellow/10 text-yellow-700":"bg-red/10 text-red"}`}>
                  {{debutant:"Débutant",intermediaire:"Intermédiaire",avance:"Expert"}[form.niveau]}
                </span></span>
                <span className="text-gray-400">Langages</span>
                <div className="flex flex-wrap gap-1">
                  {form.langages.length>0 ? form.langages.map(l=><span key={l} className="font-mono text-[10px] bg-ink text-gray-300 px-2 py-0.5 rounded">{l}</span>) : <span className="text-gray-300">—</span>}
                </div>
                <span className="text-gray-400">Contenu</span>
                <span>{sections.length} section{sections.length!==1?"s":""}{totalBlocs>0?` · ${totalBlocs} bloc${totalBlocs!==1?"s":""}`:""}
                  {pdfFile?` · PDF (${pdfFile.name})`:""}</span>
              </div>
            </div>
            {user.role === "admin"
              ? <div className="bg-green/10 border border-green/20 rounded-xl px-4 py-3 mb-5 text-sm text-green-dark">✓ En tant qu'admin, le projet sera <strong>visible immédiatement</strong> après publication.</div>
              : <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">⚠ Ton projet sera soumis à validation par l'admin avant d'être publié.</div>
            }
            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">{error}</p>}
            <div className="flex justify-between gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">← Retour</button>
              <div className="flex gap-3">
                <button onClick={() => handleSave(false)} disabled={saving}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "..." : "Brouillon"}
                </button>
                <button onClick={() => handleSave(true)} disabled={saving}
                  className="px-6 py-2.5 bg-ink hover:bg-ink-2 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saving ? "Publication..." : <span>Publier <span className="text-green">→</span></span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
