import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { workshopService, domaineService, langageService } from "../../services/api.js";

// ── Éditeur de contenu structuré ─────────────────────────────────────────────
// Un "contenu" est une liste de sections, chaque section ayant des blocs.
// Types de blocs : texte, code, étape, conseil, avertissement

function BlockEditor({ block, onChange, onDelete }) {
  const types = [
    { value: "texte",         label: "Texte"        },
    { value: "code",          label: "Bloc de code" },
    { value: "etape",         label: "Étape guidée" },
    { value: "conseil",       label: "Conseil"      },
    { value: "avertissement", label: "Avertissement"},
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3 relative group">
      <button onClick={onDelete}
        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        ✕ supprimer
      </button>

      <select value={block.type} onChange={e => onChange({ ...block, type: e.target.value })}
        className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-600">
        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      {block.type === "code" && (
        <select value={block.langage || "bash"} onChange={e => onChange({ ...block, langage: e.target.value })}
          className="ml-2 text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50">
          {["bash","c","cpp","python","javascript","java","go","rust","sql"].map(l =>
            <option key={l} value={l}>{l}</option>
          )}
        </select>
      )}

      {block.type === "etape" && (
        <input value={block.titre || ""} onChange={e => onChange({ ...block, titre: e.target.value })}
          placeholder="Titre de l'étape (ex: Étape 1 — Créer le lexer)"
          className="w-full text-sm border border-gray-200 rounded px-3 py-1.5 font-medium" />
      )}

      <textarea
        value={block.contenu || ""}
        onChange={e => onChange({ ...block, contenu: e.target.value })}
        placeholder={
          block.type === "code"          ? "// Écris ton code ici..." :
          block.type === "etape"         ? "Description détaillée de l'étape..." :
          block.type === "conseil"       ? "Conseil ou astuce pour l'étudiant..." :
          block.type === "avertissement" ? "Point d'attention important..." :
          "Écris ton texte explicatif ici..."
        }
        rows={block.type === "code" ? 8 : 4}
        className={`w-full text-sm border border-gray-200 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-green-500
          ${block.type === "code" ? "font-mono bg-gray-950 text-green-400" : ""}
          ${block.type === "conseil" ? "bg-blue-50" : ""}
          ${block.type === "avertissement" ? "bg-yellow-50" : ""}
        `}
      />
    </div>
  );
}

function SectionEditor({ section, onChange, onDelete, index }) {
  const addBlock = (type) => {
    onChange({
      ...section,
      blocs: [...(section.blocs || []), { type, contenu: "", id: Date.now() }],
    });
  };

  const updateBlock = (i, updated) => {
    const blocs = [...section.blocs];
    blocs[i] = updated;
    onChange({ ...section, blocs });
  };

  const deleteBlock = (i) => {
    onChange({ ...section, blocs: section.blocs.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          Section {index + 1}
        </span>
        <input
          value={section.titre || ""}
          onChange={e => onChange({ ...section, titre: e.target.value })}
          placeholder="Titre de la section (ex: Introduction, Lexing, Code Generation...)"
          className="flex-1 text-sm font-semibold border border-gray-200 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0">
          Supprimer section
        </button>
      </div>

      <div className="space-y-3">
        {(section.blocs || []).map((bloc, i) => (
          <BlockEditor key={bloc.id || i} block={bloc}
            onChange={(updated) => updateBlock(i, updated)}
            onDelete={() => deleteBlock(i)} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <p className="text-xs text-gray-400 w-full">Ajouter un bloc :</p>
        {[
          { type: "etape",         label: "+ Étape",         cls: "bg-green-50 text-green-700 border-green-200" },
          { type: "texte",         label: "+ Texte",         cls: "bg-gray-100 text-gray-600 border-gray-200" },
          { type: "code",          label: "+ Code",          cls: "bg-gray-900 text-green-400 border-gray-700" },
          { type: "conseil",       label: "+ Conseil",       cls: "bg-blue-50 text-blue-600 border-blue-200" },
          { type: "avertissement", label: "+ Attention",     cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
        ].map(({ type, label, cls }) => (
          <button key={type} onClick={() => addBlock(type)}
            className={`px-3 py-1 rounded border text-xs font-medium transition-opacity hover:opacity-80 ${cls}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Formulaire principal ──────────────────────────────────────────────────────
export default function AdminWorkshopForm() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const isEdit       = Boolean(id);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    titre: "", description: "", niveau: "debutant",
    langages: [], domaine_id: "", duree_heures: 1, publie: false,
  });
  const [sections,  setSections]  = useState([]);
  const [domaines,  setDomaines]  = useState([]);
  const [langages,  setLangages]  = useState([]);
  const [pdfFile,   setPdfFile]   = useState(null);
  const [pdfExist,  setPdfExist]  = useState(null);  // URL du PDF déjà enregistré
  const [modeContenu, setModeContenu] = useState("editeur"); // "editeur" | "pdf" | "les-deux"
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  // Charger domaines + langages
  useEffect(() => {
    domaineService.getAll().then(({ data }) => setDomaines(data));
    langageService.getAll().then(({ data }) => setLangages(data));
  }, []);

  // Charger workshop si édition
  useEffect(() => {
    if (!isEdit) return;
    workshopService.getById(id).then(({ data }) => {
      setForm({
        titre:        data.titre        || "",
        description:  data.description  || "",
        niveau:       data.niveau       || "debutant",
        langages:     data.langages     || [],
        domaine_id:   data.domaine_id   || "",
        duree_heures: data.duree_heures || 1,
        publie:       data.publie       || false,
      });
      if (data.contenu?.sections) setSections(data.contenu.sections);
      if (data.pdf_url) setPdfExist(data.pdf_url);

      // Déterminer le mode
      if (data.pdf_url && data.contenu) setModeContenu("les-deux");
      else if (data.pdf_url)            setModeContenu("pdf");
      else                              setModeContenu("editeur");
    });
  }, [id, isEdit]);

  const toggleLangage = (nom) => {
    setForm(f => ({
      ...f,
      langages: f.langages.includes(nom)
        ? f.langages.filter(l => l !== nom)
        : [...f.langages, nom],
    }));
  };

  const addSection = () => {
    setSections(s => [...s, { titre: "", blocs: [], id: Date.now() }]);
  };

  const handleSubmit = async (publie) => {
    if (!form.titre.trim()) { setError("Le titre est obligatoire."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("titre",        form.titre);
      fd.append("description",  form.description);
      fd.append("niveau",       form.niveau);
      fd.append("langages",     JSON.stringify(form.langages));
      fd.append("domaine_id",   form.domaine_id);
      fd.append("duree_heures", form.duree_heures);
      fd.append("publie",       publie);

      // Contenu éditeur
      if ((modeContenu === "editeur" || modeContenu === "les-deux") && sections.length > 0) {
        fd.append("contenu", JSON.stringify({ sections }));
      }

      // PDF
      if (pdfFile) fd.append("pdf", pdfFile);

      if (isEdit) await workshopService.update(id, fd);
      else        await workshopService.create(fd);

      navigate("/admin/workshops");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("/admin/workshops")}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Modifier le workshop" : "Nouveau workshop"}
        </h1>
      </div>

      <div className="space-y-6">

        {/* ── Infos générales ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Informations générales</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Titre *</label>
            <input value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
              placeholder="Ex: Écrire un compilateur C de zéro"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description courte</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Résumé du projet en 2-3 phrases..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Domaine</label>
              <select value={form.domaine_id} onChange={e => setForm(f => ({ ...f, domaine_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">— Choisir —</option>
                {domaines.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Niveau</label>
              <select value={form.niveau} onChange={e => setForm(f => ({ ...f, niveau: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Avancé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Durée estimée (h)</label>
              <input type="number" min={1} max={100} value={form.duree_heures}
                onChange={e => setForm(f => ({ ...f, duree_heures: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Langages de programmation</label>
            <div className="flex flex-wrap gap-2">
              {langages.map(l => (
                <button key={l.id} type="button" onClick={() => toggleLangage(l.nom)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                    ${form.langages.includes(l.nom)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                  {l.nom}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mode contenu ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Contenu du workshop</h2>

          <div className="flex gap-3">
            {[
              { value: "editeur",   label: "Éditeur",          desc: "Rédige le contenu directement ici" },
              { value: "pdf",       label: "Upload PDF",        desc: "Uploade un PDF déjà rédigé"        },
              { value: "les-deux",  label: "Éditeur + PDF",     desc: "Les deux en même temps"            },
            ].map(({ value, label, desc }) => (
              <button key={value} type="button" onClick={() => setModeContenu(value)}
                className={`flex-1 p-3 rounded-lg border text-left transition-colors
                  ${modeContenu === value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"}`}>
                <p className={`text-sm font-medium ${modeContenu === value ? "text-green-700" : "text-gray-700"}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          {/* Upload PDF */}
          {(modeContenu === "pdf" || modeContenu === "les-deux") && (
            <div className="space-y-2">
              {pdfExist && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                  <span className="text-red-600">📄</span>
                  <span className="text-gray-600 flex-1">PDF actuel : <a href={pdfExist} target="_blank" rel="noreferrer" className="text-red-600 hover:underline">voir le fichier</a></span>
                </div>
              )}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                {pdfFile ? (
                  <p className="text-sm text-green-600 font-medium">📄 {pdfFile.name}</p>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm">Clique pour uploader un PDF</p>
                    <p className="text-gray-300 text-xs mt-1">Max 50 Mo</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
                onChange={e => setPdfFile(e.target.files[0] || null)} />
            </div>
          )}

          {/* Éditeur de sections */}
          {(modeContenu === "editeur" || modeContenu === "les-deux") && (
            <div className="space-y-4">
              {sections.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-sm">Aucune section pour l'instant</p>
                  <button onClick={addSection}
                    className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium">
                    + Ajouter la première section
                  </button>
                </div>
              ) : (
                <>
                  {sections.map((section, i) => (
                    <SectionEditor key={section.id || i} section={section} index={i}
                      onChange={(updated) => {
                        const s = [...sections]; s[i] = updated; setSections(s);
                      }}
                      onDelete={() => setSections(sections.filter((_, idx) => idx !== i))}
                    />
                  ))}
                  <button onClick={addSection}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-green-400 hover:text-green-600 text-sm font-medium transition-colors">
                    + Ajouter une section
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Erreur + Actions ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={() => navigate("/admin/workshops")}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={() => handleSubmit(false)} disabled={saving}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? "Sauvegarde..." : "Sauvegarder en brouillon"}
          </button>
          <button onClick={() => handleSubmit(true)} disabled={saving}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}
