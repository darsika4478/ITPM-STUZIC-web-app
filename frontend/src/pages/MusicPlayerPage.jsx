// MusicPlayerPage.jsx – route /music, reads ?mood= from URL
import { useSearchParams } from "react-router-dom";
import BaseLayout from "../layout/BaseLayout";
import MusicPlayer from "../components/musicPlayer/MusicPlayer";

export default function MusicPlayerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mood = searchParams.get("mood") || "neutral";

  const handleMoodChange = (newMood) => {
    setSearchParams({ mood: newMood });
  };

  return (
    <BaseLayout>
      <MusicPlayer mood={mood} onMoodChange={handleMoodChange} />
    </BaseLayout>
  );
}
