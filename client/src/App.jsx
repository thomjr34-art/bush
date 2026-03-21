import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar         from "./components/layout/Navbar.jsx";
import Home           from "./pages/Home.jsx";
import Workshops      from "./pages/Workshops.jsx";
import WorkshopDetail from "./pages/WorkshopDetail.jsx";
import Parcours       from "./pages/Parcours.jsx";
import CreateProject  from "./pages/CreateProject.jsx";

import AdminLayout       from "./pages/admin/AdminLayout.jsx";
import AdminDashboard    from "./pages/admin/AdminDashboard.jsx";
import AdminWorkshops    from "./pages/admin/AdminWorkshops.jsx";
import AdminWorkshopForm from "./pages/admin/AdminWorkshopForm.jsx";

function StudentLayout() {
  return (
    <div className="min-h-screen bg-[#F4F5F0]">
      <Navbar />
      <Outlet />
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
      <AppRoutes />
    </AuthProvider>
  );
}
