import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  { to: "/admin",            label: "Dashboard",  exact: true },
  { to: "/admin/workshops",  label: "Workshops"               },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <p className="text-sm text-green-400 font-bold tracking-wide">Bush</p>
          <p className="text-xs text-gray-400 mt-1">Interface admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium transition-colors
                 ${isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-gray-700"}`
              }>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">{user?.nom}</p>
          <button onClick={handleLogout}
            className="w-full text-xs text-left text-red-400 hover:text-red-300 transition-colors">
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
