import { Routes, Route, Navigate } from "react-router-dom";
import { MusicPlayerProvider } from "./context/MusicPlayerContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MusicPlayerFullScreen from "./pages/MusicPlayerFullScreen.jsx";
import StudySessionPage from "./pages/StudySessionPage.jsx";
import AuthGuard from "./components/user-management/AuthGuard";
import OverviewLayout from "./layout/OverviewLayout";
import OverviewHome from "./pages/OverviewHome";
import MyProfile from "./pages/MyProfile";
import TasksPlanner from "./pages/TasksPlanner";
import MoodInputPage from "./features/mood_and_music/pages/MoodInputPage.jsx";
import MoodRecommendationPage from "./features/mood_and_music_recommendation/pages/MoodRecommendationPage.jsx";
import MoodHistoryPage from "./features/mood_history/pages/MoodHistoryPage.jsx";
import MoodAnalyticsPage from "./features/mood_analytics/pages/MoodAnalyticsPage.jsx";
import CalendarUI from "./features/Schedule&Reminder/Calendarpage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";

// Admin imports
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminGuard from "./admin/components/AdminGuard.jsx";
import AdminLayout from "./admin/layout/AdminLayout.jsx";
import AdminUsersPage from "./admin/pages/AdminUsersPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<MusicPlayerProvider><OverviewLayout /></MusicPlayerProvider>}>
          <Route index element={<OverviewHome />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="tasks" element={<TasksPlanner />} />
          <Route path="calendar" element={<CalendarUI />} />
          <Route path="mood" element={<MoodInputPage />} />
          <Route path="mood-recommendation" element={<MoodRecommendationPage />} />
          <Route path="mood-history" element={<MoodHistoryPage />} />
          <Route path="study-session" element={<StudySessionPage />} />
          <Route path="mood-analytics" element={<MoodAnalyticsPage />} />
          <Route path="music" element={<MusicPlayerFullScreen />} />
        </Route>
      </Route>
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="dashboard" element={<Navigate to="../users" replace />} />
          <Route path="tasks" element={<Navigate to="../users" replace />} />
          <Route path="mood-reports" element={<Navigate to="../users" replace />} />
          <Route path="sessions" element={<Navigate to="../users" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
