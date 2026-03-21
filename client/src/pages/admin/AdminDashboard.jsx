import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { workshopService } from "../../services/api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, publie: 0, brouillon: 0 });

  useEffect(() => {
    workshopService.getAll().then(({ data }) => {
      setStats({
        total:    data.length,
        publie:   data.filter(w => w.publie).length,
        brouillon: data.filter(w => !w.publie).length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total workshops", value: stats.total,     color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Publiés",         value: stats.publie,    color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Brouillons",      value: stats.brouillon, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg border p-5 ${color}`}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Link to="/admin/workshops/new"
        className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
        + Créer un nouveau workshop
      </Link>
    </div>
  );
}
