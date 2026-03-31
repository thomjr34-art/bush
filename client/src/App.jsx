import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { FontSizeProvider, useFontSize } from "./context/FontSizeContext.jsx";
import Navbar         from "./components/layout/Navbar.jsx";
import Home           from "./pages/Home.jsx";
import Workshops      from "./pages/Workshops.jsx";
import WorkshopDetail from "./pages/WorkshopDetail.jsx";
import Parcours       from "./pages/Parcours.jsx";
import CreateProject  from "./pages/CreateProject.jsx";
import Playground     from "./pages/Playground.jsx";

import AdminLayout       from "./pages/admin/AdminLayout.jsx";
import AdminDashboard    from "./pages/admin/AdminDashboard.jsx";
import AdminWorkshops    from "./pages/admin/AdminWorkshops.jsx";
import AdminWorkshopForm from "./pages/admin/AdminWorkshopForm.jsx";

function FontSizeControls() {
  const { increase, decrease, reset, scale } = useFontSize();
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center bg-white shadow-lg border border-gray-200 rounded-full p-1 gap-1">
      <button onClick={decrease} disabled={scale <= 80}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold text-xs disabled:opacity-30" title="Réduire le texte">
        A-
      </button>
      <button onClick={reset} 
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xs font-mono" title="Taille par défaut">
        {scale}%
      </button>
      <button onClick={increase} disabled={scale >= 130}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-800 font-bold text-sm disabled:opacity-30" title="Agrandir le texte">
        A+
      </button>
    </div>
  );
}

function StudentLayout() {
  return (
    <div className="min-h-screen bg-[#F4F5F0]">
      <Navbar />
      <Outlet />
      <FontSizeControls />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route path="/"              element={<Home />} />
        <Route path="/workshops"     element={<Workshops />} />
        <Route path="/workshops/:id" element={<WorkshopDetail />} />
        <Route path="/parcours"      element={<Parcours />} />
        <Route path="/create"        element={<CreateProject />} />
        <Route path="/playground"    element={<Playground />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index                element={<AdminDashboard />} />
        <Route path="workshops"     element={<AdminWorkshops />} />
        <Route path="workshops/new" element={<AdminWorkshopForm />} />
        <Route path="workshops/:id" element={<AdminWorkshopForm />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FontSizeProvider>
        <AppRoutes />
      </FontSizeProvider>
    </AuthProvider>
  );
}
