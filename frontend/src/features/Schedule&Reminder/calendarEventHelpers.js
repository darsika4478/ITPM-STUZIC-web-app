export function formatHHMM(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function firestoreDocToUiEvent(docSnap) {
  const d = docSnap.data();
  let time = "";
  if (d.type === "Deadline" && d.deadlineTime) {
    time = formatHHMM(new Date(d.deadlineTime));
  } else if (d.startTime) {
    time = formatHHMM(new Date(d.startTime));
  }
  const category =
    d.type === "Lecture"
      ? "Lectures"
      : d.type === "Deadline"
        ? "Deadlines"
        : d.type === "Exam"
          ? "Exams"
          : "Study Session";
  return {
    id: docSnap.id,
    time,
    title: d.title,
    category,
    type: d.type,
    startTime: d.startTime,
    endTime: d.endTime,
    deadlineTime: d.deadlineTime,
    reminder: d.reminder,
  };
}

export function buildEventsMapFromSnapshot(querySnapshot) {
  const map = {};
  querySnapshot.forEach((docSnap) => {
    const key = docSnap.data().dateKey;
    if (!key) return;
    const ev = firestoreDocToUiEvent(docSnap);
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  });
  Object.keys(map).forEach((k) => {
    map[k].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  });
  return map;
}
