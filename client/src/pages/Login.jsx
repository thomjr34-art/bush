import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api.js";
import { useAuth }     from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm]   = useState({ email: "", mot_de_passe: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login }         = useAuth();
  const navigate          = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const { data } = await authService.login(form);
      login(data.user, data.token);
      navigate(data.user.role === "admin" ? "/admin" : "/workshops");
    } catch(err) {
      setError(err.response?.data?.error || "Identifiants incorrects.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#F4F5F0] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-ink flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-mono font-bold">AD</span>
          </div>
          <h1 className="font-syne font-bold text-2xl text-ink">Connexion</h1>
          <p className="text-gray-400 text-sm mt-1">Accède à ton espace Bush</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/40 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mot de passe</label>
            <input type="password" value={form.mot_de_passe} onChange={e => setForm(f=>({...f,mot_de_passe:e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green/40 focus:border-transparent" required />
          </div>
          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green hover:bg-green-dark text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
