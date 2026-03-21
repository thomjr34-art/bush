import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-ink border-b border-ink-3">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded bg-green flex items-center justify-center">
            <span className="text-white font-mono font-bold text-xs">AD</span>
          </div>
          <span className="font-syne font-bold text-white text-base tracking-tight">
            AfricaDev<span className="text-green">Hub</span>
          </span>
        </Link>

        {/* Nav centrale */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/workshops", label: "Explorer" },
            { to: "/parcours",  label: "Parcours"  },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${isActive(to) ? "bg-ink-2 text-white" : "text-gray-400 hover:text-white hover:bg-ink-2"}`}>
              {label}
            </Link>
          ))}

          {/* CTA Créer un projet — visible pour tous */}
          <Link to="/create"
            className={`ml-2 px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5
              ${isActive("/create")
                ? "bg-green text-white"
                : "bg-green/10 text-green border border-green/30 hover:bg-green hover:text-white"}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            Créer un projet
          </Link>
        </nav>

        {/* Droite */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin"
              className="px-3 py-1.5 bg-yellow/10 border border-yellow/30 text-yellow rounded text-xs font-medium hover:bg-yellow hover:text-ink transition-colors">
              Admin
            </Link>
          )}
          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-ink-2 hover:bg-ink-3 transition-colors">
                <div className="w-6 h-6 rounded-full bg-green flex items-center justify-center text-white text-xs font-bold">
                  {user.nom?.[0]?.toUpperCase()}
                </div>
                <span className="text-white text-sm hidden sm:block">{user.nom}</span>
              </button>
              {open && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-ink-2 border border-ink-3 rounded-lg shadow-xl overflow-hidden">
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-ink-3 hover:text-white transition-colors">
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              className="px-3 py-1.5 bg-white text-ink rounded text-sm font-medium hover:bg-gray-100 transition-colors">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
