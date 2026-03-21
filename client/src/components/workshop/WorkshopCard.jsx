import { Link } from "react-router-dom";

const niveauStyle = {
  debutant:      { label: "Débutant",      cls: "bg-green/10 text-green-dark border-green/20" },
  intermediaire: { label: "Intermédiaire", cls: "bg-yellow/10 text-yellow-600 border-yellow/20" },
  avance:        { label: "Avancé",        cls: "bg-red/10 text-red border-red/20" },
};

export default function WorkshopCard({ workshop }) {
  const n = niveauStyle[workshop.niveau] || niveauStyle.debutant;

  return (
    <Link to={`/workshops/${workshop.id}`}
      className="group block bg-white border border-gray-100 rounded-2xl p-5 hover:border-green/40 hover:shadow-md transition-all duration-200">

      {/* Top */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${n.cls}`}>
            {n.label}
          </span>
          {workshop.domaine_nom && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
              {workshop.domaine_nom}
            </span>
          )}
        </div>
        {workshop.pdf_url && (
          <span className="shrink-0 text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
            PDF
          </span>
        )}
      </div>

      {/* Titre */}
      <h3 className="font-syne font-bold text-ink text-base leading-snug mb-2 group-hover:text-green-dark transition-colors line-clamp-2">
        {workshop.titre}
      </h3>

      {/* Description */}
      {workshop.description && (
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4">
          {workshop.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <div className="flex flex-wrap gap-1">
          {(workshop.langages || []).slice(0, 3).map(l => (
            <span key={l} className="font-mono text-[10px] bg-ink text-gray-300 px-2 py-0.5 rounded">
              {l}
            </span>
          ))}
          {(workshop.langages || []).length > 3 && (
            <span className="font-mono text-[10px] text-gray-400">
              +{workshop.langages.length - 3}
            </span>
          )}
        </div>
        {workshop.duree_heures && (
          <span className="text-[11px] text-gray-400">⏱ {workshop.duree_heures}h</span>
        )}
      </div>
    </Link>
  );
}
