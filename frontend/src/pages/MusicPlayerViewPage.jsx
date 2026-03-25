// MusicPlayerViewPage.jsx – Dedicated page for music player view
import { useSearchParams } from "react-router-dom";
import BaseLayout from "../layout/BaseLayout";
import MusicPlayerView from "../components/musicPlayer/MusicPlayerView";

export default function MusicPlayerViewPage() {
  const [searchParams] = useSearchParams();
  const mood = searchParams.get("mood") || "focus";

  return (
    <BaseLayout>
      <MusicPlayerView mood={mood} />
    </BaseLayout>
  );
}