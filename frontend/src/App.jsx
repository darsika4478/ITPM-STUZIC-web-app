import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AuthGuard from "./components/user-management/AuthGuard";
import OverviewLayout from "./layout/OverviewLayout";
import OverviewHome from "./pages/OverviewHome";
import MyProfile from "./pages/MyProfile";
import MoodRecommendationPage from "./features/mood_and_music_recommendation/pages/MoodRecommendationPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />

      {/* Protected routes - require authentication */}
      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<OverviewLayout />}>
          <Route index element={<OverviewHome />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/mood-recommendation" element={<MoodRecommendationPage />} />
    </Routes>
  );
}
