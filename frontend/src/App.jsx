import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
<<<<<<< HEAD
import MusicPlayerLayout from "./pages/MusicPlayerLayout.jsx";
=======
import AuthGuard from "./components/user-management/AuthGuard";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import MyProfile from "./pages/MyProfile";
<<<<<<< HEAD
=======
import TasksPlanner from "./pages/TasksPlanner";
import MoodInputPage from "./features/mood_and_music/pages/MoodInputPage.jsx";
>>>>>>> origin/dev
import MoodRecommendationPage from "./features/mood_and_music_recommendation/pages/MoodRecommendationPage.jsx";

import MoodHistoryPage from "./features/mood_history/pages/MoodHistoryPage.jsx";
import MoodAnalyticsPage from "./features/mood_analytics/pages/MoodAnalyticsPage.jsx";
>>>>>>> f2b9df4100d3acc8891a43b7826cb12eb215dd72

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
<<<<<<< HEAD
      <Route path="/register" element={<Register />} />
      <Route path="/music" element={<MusicPlayerLayout />} />
=======
      <Route path="/signup" element={<Register />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />

      {/* Protected routes - require authentication */}
      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<MyProfile />} />
<<<<<<< HEAD
=======
          <Route path="tasks" element={<TasksPlanner />} />
          <Route path="mood" element={<MoodInputPage />} />
          <Route path="mood-recommendation" element={<MoodRecommendationPage />} />
          <Route path="mood-history" element={<MoodHistoryPage />} />
          <Route path="mood-analytics" element={<MoodAnalyticsPage />} />
>>>>>>> origin/dev
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
>>>>>>> f2b9df4100d3acc8891a43b7826cb12eb215dd72
    </Routes>
  );
}
