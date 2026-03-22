import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AuthGuard from "./components/user-management/AuthGuard";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import MyProfile from "./pages/MyProfile";
import TasksPlanner from "./pages/TasksPlanner";
import MoodInputPage from "./features/mood_and_music/pages/MoodInputPage.jsx";
import MoodRecommendationPage from "./features/mood_and_music_recommendation/pages/MoodRecommendationPage.jsx";

import MoodHistoryPage from "./features/mood_history/pages/MoodHistoryPage.jsx";

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
          <Route path="tasks" element={<TasksPlanner />} />
          <Route path="mood" element={<MoodInputPage />} />
          <Route path="mood-recommendation" element={<MoodRecommendationPage />} />
          <Route path="mood-history" element={<MoodHistoryPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
