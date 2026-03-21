import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { workshopService } from "../services/api.js";
import WorkshopCard from "../components/workshop/WorkshopCard.jsx";

export default function Home() {
  const [recentWorkshops, setRecentWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    workshopService.getAll()
      .then(({ data }) => {
        const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentWorkshops(sorted.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-ink text-white px-6 py-24 relative overflow-hidden">
        {/* Deco */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, #00A651 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green/10 border border-green/20 text-green text-xs font-mono px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Apprendre en construisant — pour l'Afrique
          </div>
          <h1 className="font-syne font-extrabold text-5xl md:text-6xl leading-tight mb-6">
            Construis de vrais<br />
            <span className="text-green">projets.</span> Comprends<br />
            comment ça marche.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Une plateforme de projets guidés pas-à-pas pour maîtriser l'informatique
            — des fondements aux systèmes, accessible offline.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/workshops"
              className="px-6 py-3 bg-green hover:bg-green-dark text-white font-semibold rounded-xl transition-colors">
              Explorer les projets
            </Link>
            <Link to="/create"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors">
              Créer un projet
            </Link>
          </div>
        </div>
      </section>

      {/* Bande tricolore */}
      <div className="flex h-1">
        <div className="flex-1 bg-green" />
        <div className="flex-1 bg-red" />
        <div className="flex-1 bg-yellow" />
      </div>

      {/* Derniers Projets */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-syne font-bold text-2xl text-ink mb-2">Derniers projets</h2>
          <p className="text-gray-500 mb-8">Lance-toi dans les dernières aventures proposées par la communauté.</p>

          {loading ? (
            <div className="text-center text-gray-400">Chargement des projets...</div>
          ) : recentWorkshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentWorkshops.map(workshop => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-10 bg-gray-50 rounded-xl">Aucun projet publié pour le moment.</div>
          )}
          <div className="text-center mt-10">
            <Link to="/workshops" className="px-6 py-3 bg-green/10 text-green font-semibold rounded-xl transition-colors hover:bg-green/20">
              Voir tous les projets
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-y border-gray-100 px-6 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { n: "10+", label: "Domaines couverts" },
            { n: "∞",   label: "Projets à venir"   },
            { n: "100%",label: "Gratuit & offline"  },
          ].map(({ n, label }) => (
            <div key={label}>
              <p className="font-syne font-extrabold text-3xl text-ink mb-1">{n}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
