// SessionTrackerViewPage.jsx – Dedicated page for session tracking view
import { useSearchParams } from "react-router-dom";
import BaseLayout from "../layout/BaseLayout";
import SessionTrackerView from "../components/musicPlayer/SessionTrackerView";

export default function SessionTrackerViewPage() {
  const [searchParams] = useSearchParams();
  const mood = searchParams.get("mood") || "focus";

  return (
    <BaseLayout>
      <SessionTrackerView mood={mood} />
    </BaseLayout>
  );
}