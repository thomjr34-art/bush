import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { workshopService, domaineService, langageService } from "../services/api.js";

// ── Bloc de contenu ──────────────────────────────────────────────────────────
function BlocEditor({ bloc, onChange, onDelete, index }) {
  const LANGS = ["bash","c","cpp","python","javascript","typescript","java","go","rust","sql","plaintext"];

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 transition-colors">

      {/* Header du bloc */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-gray-400">bloc {index+1}</span>
          <select value={bloc.type} onChange={e => onChange({ ...bloc, type: e.target.value, contenu: "" })}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green/40">
            <option value="texte">📝 Texte</option>
            <option value="code">💻 Code</option>
            <option value="etape">✅ Étape guidée</option>
            <option value="conseil">💡 Conseil</option>
            <option value="avertissement">⚠️ Avertissement</option>
          </select>
          {bloc.type === "code" && (
            <select value={bloc.langage || "bash"} onChange={e => onChange({ ...bloc, langage: e.target.value })}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green/40">
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          )}
        </div>
        <button onClick={onDelete}
          className="text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
          × Supprimer
        </button>
      </div>

      {/* Titre pour les étapes */}
      {bloc.type === "etape" && (
        <div className="px-4 pt-3">
          <input value={bloc.titre || ""} onChange={e => onChange({ ...bloc, titre: e.target.value })}
            placeholder="Titre de l'étape (ex: Étape 1 — Écrire le lexer)"
            className="w-full text-sm font-semibold border-b border-gray-100 pb-2 focus:outline-none placeholder:text-gray-300 focus:border-green/40" />
        </div>
      )}

      {/* Zone de contenu */}
      <textarea
        value={bloc.contenu || ""}
        onChange={e => onChange({ ...bloc, contenu: e.target.value })}
        spellCheck={bloc.type !== "code"}
        placeholder={
          bloc.type === "code"          ? `// Colle ou écris ton code ${bloc.langage || ""} ici\n// L'indentation sera préservée` :
          bloc.type === "etape"         ? "Décris cette étape en détail. Explique le pourquoi, pas seulement le comment..." :
          bloc.type === "conseil"       ? "Partage une astuce, une bonne pratique, ou une ressource utile..." :
          bloc.type === "avertissement" ? "Signale un piège courant, une erreur fréquente à éviter..." :
          "Écris ton explication ici. Tu peux utiliser plusieurs paragraphes..."
        }
        rows={bloc.type === "code" ? 10 : 5}
        className={`w-full px-4 py-3 text-sm resize-y focus:outline-none leading-relaxed
          ${bloc.type === "code"
            ? "font-mono bg-[#0F1117] text-green text-[13px] placeholder:text-gray-700"
            : "text-gray-700 placeholder:text-gray-300"}
          ${bloc.type === "conseil"       ? "bg-blue-50 text-blue-800 placeholder:text-blue-300"  : ""}
          ${bloc.type === "avertissement" ? "bg-amber-50 text-amber-800 placeholder:text-amber-300" : ""}
        `}
      />
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
function SectionEditor({ section, onChange, onDelete, index }) {
  const addBloc = (type) => onChange({
    ...section,
    blocs: [...(section.blocs||[]), { type, contenu: "", langage: "python", id: Date.now() }]
  });

  return (
    <div className="border-2 border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/50">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-green flex items-center justify-center text-white font-mono font-bold text-xs shrink-0">
          {index+1}
        </div>
        <input value={section.titre||""} onChange={e => onChange({ ...section, titre: e.target.value })}
          placeholder="Titre de la section (ex: Introduction, Lexing, Parsing...)"
          className="flex-1 font-syne font-semibold text-base bg-transparent border-b-2 border-gray-200 pb-1.5 focus:outline-none focus:border-green/60 placeholder:text-gray-300 transition-colors" />
        <button onClick={onDelete}
          className="text-xs text-gray-300 hover:text-red-500 transition-colors shrink-0">
          Supprimer
        </button>
      </div>

      <div className="space-y-3">
        {(section.blocs||[]).map((bloc, i) => (
          <BlocEditor key={bloc.id||i} bloc={bloc} index={i}
            onChange={u => { const b=[...section.blocs]; b[i]=u; onChange({...section, blocs:b}); }}
            onDelete={() => onChange({ ...section, blocs: section.blocs.filter((_,j)=>j!==i) })}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { type:"etape",         label:"+ Étape",       cls:"border-green/30 text-green bg-green/5 hover:bg-green/10" },
          { type:"texte",         label:"+ Texte",       cls:"border-gray-200 text-gray-600 bg-white hover:bg-gray-50" },
          { type:"code",          label:"+ Code",        cls:"border-gray-700 text-green bg-[#0F1117] hover:bg-[#1a1f2e]" },
          { type:"conseil",       label:"+ Conseil",     cls:"border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100" },
          { type:"avertissement", label:"+ Attention",   cls:"border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100" },
        ].map(({ type, label, cls }) => (
          <button key={type} onClick={() => addBloc(type)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${cls}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════
export default function CreateProject() {
  // MOCK USER : Simulation d'un admin connecté (puisque l'auth est désactivée)
  const user = {
    id: "admin-mock-id",
    nom: "Admin",
    role: "admin"
  };
  const navigate   = useNavigate();
  const fileRef    = useRef(null);

  const [step,     setStep]     = useState(1); // 1=infos, 2=contenu, 3=preview
  const [form,     setForm]     = useState({
    titre: "", description: "", niveau: "debutant",
    langages: [], domaine_id: "", duree_heures: 2,
  });
  const [sections, setSections] = useState([]);
  const [pdfFile,  setPdfFile]  = useState(null);
  const [mode,     setMode]     = useState("editeur"); // editeur | pdf | les-deux
  const [domaines, setDomaines] = useState([]);
  const [langages, setLangages] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    domaineService.getAll().then(({ data }) => setDomaines(data));
    langageService.getAll().then(({ data }) => setLangages(data));
  }, []);

  const toggleLang = (nom) => setForm(f => ({
    ...f, langages: f.langages.includes(nom) ? f.langages.filter(l=>l!==nom) : [...f.langages, nom]
  }));

  const addSection = () => setSections(s => [...s, { titre:"", blocs:[], id: Date.now() }]);

  const handleSave = async (publie = false) => {
    if (!form.titre.trim()) { setError("Le titre est obligatoire."); return; }
    if (user.role !== "admin" && publie) { setError("Seul l'admin peut publier directement."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => {
        if (k === "langages") fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      const canPublish = user.role === "admin" && publie;
      fd.append("publie", String(canPublish));
      if ((mode==="editeur"||mode==="les-deux") && sections.length > 0)
        fd.append("contenu", JSON.stringify({ sections }));
      if (pdfFile) fd.append("pdf", pdfFile);
      await workshopService.create(fd);
      navigate("/");
    } catch(err) {
      setError(err.response?.data?.error || "Erreur lors de la sauvegarde.");
    } finally { setSaving(false); }
  };

  // ── Étapes ────────────────────────────────────────────────────────────────
  const STEPS = ["Informations", "Contenu", "Publier"];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F4F5F0]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-syne font-extrabold text-3xl text-ink mb-1">Créer un projet</h1>
          <p className="text-gray-500 text-sm">Guide un étudiant étape par étape dans un vrai projet.</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => i < step - 1 || i <= 1 ? setStep(i+1) : null}
                className={`flex items-center gap-2 text-sm font-medium transition-colors
                  ${step===i+1 ? "text-green" : step>i+1 ? "text-ink" : "text-gray-300"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold
                  ${step===i+1 ? "bg-green text-white" : step>i+1 ? "bg-ink text-white" : "bg-gray-200 text-gray-400"}`}>
                  {step>i+1 ? "✓" : i+1}
                </span>
                {s}
              </button>
              {i < STEPS.length-1 && (
                <div className={`flex-1 h-px mx-3 ${step>i+1 ? "bg-ink" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 : Informations ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titre du projet *</label>
                <input value={form.titre} onChange={e => setForm(f=>({...f,titre:e.target.value}))}
                  placeholder="Ex: Écrire un compilateur C de zéro"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/40 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                  placeholder="Ce que l'étudiant va construire et apprendre..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green/40 focus:border-transparent" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Domaine</label>
                  <select value={form.domaine_id} onChange={e => setForm(f=>({...f,domaine_id:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/40">
                    <option value="">— Choisir —</option>
                    {domaines.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau</label>
                  <select value={form.niveau} onChange={e => setForm(f=>({...f,niveau:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/40">
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Durée (h)</label>
                  <input type="number" min={1} value={form.duree_heures}
                    onChange={e => setForm(f=>({...f,duree_heures:parseInt(e.target.value)}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/40" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Langages utilisés</label>
                <div className="flex flex-wrap gap-2">
                  {langages.map(l => (
                    <button key={l.id} type="button" onClick={() => toggleLang(l.nom)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                        ${form.langages.includes(l.nom)
                          ? "bg-ink text-white border-ink"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                      <span className="w-2 h-2 rounded-full" style={{ background: l.couleur }} />
                      {l.nom}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => { if (!form.titre.trim()) { setError("Le titre est obligatoire."); return; } setError(""); setStep(2); }}
                className="bg-green hover:bg-green-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                Suivant →
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-right">{error}</p>}
          </div>
        )}

        {/* ── STEP 2 : Contenu ── */}
        {step === 2 && (
          <div className="space-y-5">

            {/* Mode de contenu */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Type de contenu</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { v:"editeur",  label:"Éditeur",       icon:"✏️", desc:"Rédige ici directement" },
                  { v:"pdf",      label:"Upload PDF",    icon:"📄", desc:"Uploade un PDF existant" },
                  { v:"les-deux", label:"Les deux",      icon:"⚡", desc:"Éditeur + PDF" },
                ].map(({ v, label, icon, desc }) => (
                  <button key={v} onClick={() => setMode(v)}
                    className={`p-4 rounded-xl border text-left transition-all
                      ${mode===v ? "border-green bg-green/5 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}>
                    <p className="text-xl mb-1">{icon}</p>
                    <p className={`text-sm font-semibold ${mode===v ? "text-green-dark" : "text-ink"}`}>{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload PDF */}
            {(mode==="pdf"||mode==="les-deux") && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Fichier PDF</p>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green/40 hover:bg-green/5 transition-colors">
                  {pdfFile
                    ? <p className="text-sm text-green font-medium">📄 {pdfFile.name}</p>
                    : <>
                        <p className="text-2xl mb-2">📤</p>
                        <p className="text-gray-400 text-sm">Clique pour uploader un PDF</p>
                        <p className="text-gray-300 text-xs mt-1">Max 50 Mo</p>
                      </>
                  }
                </div>
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                  onChange={e => setPdfFile(e.target.files[0]||null)} />
              </div>
            )}

            {/* Éditeur sections */}
            {(mode==="editeur"||mode==="les-deux") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Sections du projet <span className="text-gray-400 font-normal">({sections.length})</span>
                  </p>
                  <button onClick={addSection}
                    className="text-sm text-green font-medium hover:text-green-dark transition-colors">
                    + Ajouter une section
                  </button>
                </div>

                {sections.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-green/30 transition-colors" onClick={addSection}>
                    <p className="text-3xl mb-3">◎</p>
                    <p className="font-syne font-bold text-gray-300 mb-1">Aucune section</p>
                    <p className="text-sm text-gray-400">Clique pour créer la première section du projet</p>
                  </div>
                ) : (
                  sections.map((s, i) => (
                    <SectionEditor key={s.id||i} section={s} index={i}
                      onChange={u => { const arr=[...sections]; arr[i]=u; setSections(arr); }}
                      onDelete={() => setSections(sections.filter((_,j)=>j!==i))}
                    />
                  ))
                )}

                {sections.length > 0 && (
                  <button onClick={addSection}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-green/30 hover:text-green text-sm font-medium transition-colors">
                    + Nouvelle section
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
              <button onClick={() => setStep(3)}
                className="bg-green hover:bg-green-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 : Publier ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-syne font-bold text-lg text-ink mb-4">Récapitulatif</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Titre</span>
                  <span className="font-medium text-ink">{form.titre}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Niveau</span>
                  <span className="font-medium capitalize">{form.niveau}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Langages</span>
                  <span className="font-mono text-xs">{form.langages.join(", ") || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Sections</span>
                  <span>{sections.length} section{sections.length!==1?"s":""}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">PDF</span>
                  <span>{pdfFile ? pdfFile.name : "—"}</span>
                </div>
              </div>
            </div>

            {!user.role === "admin" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
                ⚠️ Ton projet sera soumis à validation par l'admin avant d'être visible publiquement.
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between gap-3">
              <button onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
              <div className="flex gap-3">
                <button onClick={() => handleSave(false)} disabled={saving}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "..." : "Sauvegarder brouillon"}
                </button>
                {user.role === "admin" && (
                  <button onClick={() => handleSave(true)} disabled={saving}
                    className="px-6 py-2.5 bg-green hover:bg-green-dark text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                    {saving ? "Publication..." : "Publier maintenant"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
