import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MusicPlayerLayout from "./pages/MusicPlayerLayout.jsx";
import MusicPlayerSessionPage from "./pages/MusicSessionModule/MusicPlayerSessionPage.jsx";
import MusicExpandedPage from "./pages/MusicSessionModule/MusicExpandedPage.jsx";
import SessionExpandedPage from "./pages/MusicSessionModule/SessionExpandedPage.jsx";
import MusicHistoryPage from "./pages/MusicSessionModule/MusicHistoryPage.jsx";
import SessionAnalyticsPage from "./pages/MusicSessionModule/SessionAnalyticsPage.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/music" element={<MusicPlayerLayout />} />
      <Route path="/player" element={<MusicPlayerSessionPage />} />
      <Route path="/player/music" element={<MusicExpandedPage />} />
      <Route path="/player/session" element={<SessionExpandedPage />} />
      <Route path="/player/music/history" element={<MusicHistoryPage />} />
      <Route path="/player/session/analytics" element={<SessionAnalyticsPage />} />
    </Routes>
  );
}