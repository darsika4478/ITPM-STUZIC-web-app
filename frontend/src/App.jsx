import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MusicPlayerLayout from "./pages/MusicPlayerLayout.jsx";
import MusicPlayerSessionPage from "./pages/MusicSessionModule/MusicPlayerSessionPage.jsx";
import MusicExpandedPage from "./pages/MusicSessionModule/MusicExpandedPage.jsx";
import SessionExpandedPage from "./pages/MusicSessionModule/SessionExpandedPage.jsx";
import MusicHistoryPage from "./pages/MusicSessionModule/MusicHistoryPage.jsx";
import SessionAnalyticsPage from "./pages/MusicSessionModule/SessionAnalyticsPage.jsx";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/music" element={<MusicPlayerLayout />} />
      <Route path="/player" element={<MusicPlayerSessionPage />} />
      <Route path="/player/music" element={<MusicExpandedPage />} />
      <Route path="/player/session" element={<SessionExpandedPage />} />
      <Route path="/player/music/history" element={<MusicHistoryPage />} />
      <Route path="/player/session/analytics" element={<SessionAnalyticsPage />} />

      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<OverviewLayout />}>
          <Route index element={<OverviewHome />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="tasks" element={<TasksPlanner />} />
          <Route path="calendar" element={<CalendarUI />} />
          <Route path="mood" element={<MoodInputPage />} />
          <Route path="mood-recommendation" element={<MoodRecommendationPage />} />
          <Route path="mood-history" element={<MoodHistoryPage />} />
          <Route path="mood-analytics" element={<MoodAnalyticsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
