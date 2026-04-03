import { Routes, Route, Navigate } from "react-router-dom";

// Admin imports
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminGuard from "./admin/components/AdminGuard.jsx";
import AdminLayout from "./admin/layout/AdminLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
