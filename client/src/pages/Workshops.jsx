import { useState, useEffect } from "react";
import Sidebar      from "../components/layout/Sidebar.jsx";
import WorkshopCard from "../components/workshop/WorkshopCard.jsx";
import { workshopService } from "../services/api.js";
import Fuse from "fuse.js";

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [filters,   setFilters]   = useState({});
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    workshopService.getAll(filters)
      .then(({ data }) => { setWorkshops(data); setFiltered(data); })
      .finally(() => setLoading(false));
  }, [filters]);

  // Recherche Fuse.js locale
  useEffect(() => {
    if (!search.trim()) { setFiltered(workshops); return; }
    const fuse = new Fuse(workshops, { keys: ["titre", "description", "langages"], threshold: 0.4 });
    setFiltered(fuse.search(search).map(r => r.item));
  }, [search, workshops]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar filters={filters} onChange={setFilters} />

      <main className="flex-1 px-8 py-7 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-syne font-bold text-2xl text-ink">
              {activeFiltersCount > 0 ? "Résultats filtrés" : "Tous les projets"}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {filtered.length} projet{filtered.length !== 1 ? "s" : ""}
              {activeFiltersCount > 0 && (
                <button onClick={() => setFilters({})}
                  className="ml-2 text-green hover:underline text-xs">
                  Effacer les filtres
                </button>
              )}
            </p>
          </div>

          {/* Recherche */}
          <div className="relative w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green/40 focus:border-green/40" />
          </div>
        </div>

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">◎</div>
            <p className="font-syne font-bold text-xl text-gray-300 mb-2">Aucun projet trouvé</p>
            <p className="text-gray-400 text-sm">
              {activeFiltersCount > 0
                ? "Essaie d'autres filtres ou "
                : "Sois le premier à "}
              <button onClick={() => setFilters({})} className="text-green hover:underline">
                {activeFiltersCount > 0 ? "efface les filtres" : "créer un projet"}
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(w => <WorkshopCard key={w.id} workshop={w} />)}
          </div>
        )}
      </main>
    </div>
  );
}
