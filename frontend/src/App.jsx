import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AuthGuard from "./components/user-management/AuthGuard";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import MyProfile from "./pages/MyProfile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />

      {/* Protected routes - require authentication */}
      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}