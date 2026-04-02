// trackService.js – fetches playlists from Firestore with dummy fallback
// Firestore collection: tracks
// Each doc: { title, artist, mood, duration, audioUrl }

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getPlaylistByMood } from "../data/dummyTracks";

const TRACKS_COLLECTION = "tracks";

/**
 * Fetch tracks for a given mood from Firestore.
 * Falls back to dummy data if Firestore is not set up or returns empty results.
 * @param {string} mood
 * @returns {Array} array of track objects
 */
export async function getPlaylistByMoodFromDB(mood) {
  try {
    const ref = collection(db, TRACKS_COLLECTION);
    const q = query(ref, where("mood", "==", mood.toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.info(`[trackService] No Firestore tracks for mood "${mood}", using dummy data.`);
      return getPlaylistByMood(mood);
    }

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("[trackService] Firestore unavailable, falling back to dummy data.", err);
    return getPlaylistByMood(mood);
  }
}
