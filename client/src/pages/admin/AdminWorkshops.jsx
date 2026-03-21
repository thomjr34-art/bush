import { useEffect, useState } from "react";
import { Link }                from "react-router-dom";
import { workshopService }     from "../../services/api.js";

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const load = () => {
    setLoading(true);
    workshopService.getAll()
      .then(({ data }) => setWorkshops(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const togglePublier = async (w) => {
    await workshopService.togglePublier(w.id, !w.publie);
    load();
  };

  const supprimer = async (id) => {
    if (!confirm("Supprimer ce workshop ?")) return;
    await workshopService.delete(id);
    load();
  };

  const niveauColor = {
    debutant:      "bg-green-100 text-green-700",
    intermediaire: "bg-yellow-100 text-yellow-700",
    avance:        "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Workshops</h1>
        <Link to="/admin/workshops/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : workshops.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun workshop pour l'instant</p>
          <Link to="/admin/workshops/new" className="text-green-600 hover:underline mt-2 inline-block">
            Créer le premier
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Titre", "Domaine", "Niveau", "Langages", "Contenu", "Statut", "Actions"]
                  .map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {workshops.map((w) => (
                <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{w.titre}</td>
                  <td className="px-4 py-3 text-gray-500">{w.domaine_nom || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${niveauColor[w.niveau]}`}>
                      {w.niveau}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(w.langages || []).map(l => (
                        <span key={l} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{l}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {w.pdf_url  && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs">PDF</span>}
                      {w.contenu  && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">Éditeur</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublier(w)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer
                        ${w.publie
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {w.publie ? "Publié" : "Brouillon"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/workshops/${w.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium">
                        Éditer
                      </Link>
                      <button onClick={() => supprimer(w.id)}
                        className="text-red-500 hover:text-red-700 font-medium">
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
