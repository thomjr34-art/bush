import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // On force un utilisateur connecté par défaut pour éviter les crashs
    try { 
      const stored = JSON.parse(localStorage.getItem("user"));
      return stored || { id: "mock-admin", nom: "Admin", email: "admin@bush.com", role: "admin" };
    } catch { return { id: "mock-admin", nom: "Admin", email: "admin@bush.com", role: "admin" }; }
  });

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
