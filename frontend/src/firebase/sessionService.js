// sessionService.js – Firestore CRUD for study sessions
// Collection structure: sessions/{userId}/records/{docId}
//
// Each session document:
// {
//   userId:        string
//   mood:          string
//   trackTitle:    string
//   startTime:     Timestamp
//   endTime:       Timestamp | null
//   durationMinutes: number | null
//   createdAt:     Timestamp
// }

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const SESSIONS_COLLECTION = "sessions";

/**
 * Start a new session – creates a Firestore document.
 * @returns {string} docId of the created session
 */
export async function startSession(userId, mood, trackTitle) {
  try {
    const ref = collection(db, SESSIONS_COLLECTION);
    const docRef = await addDoc(ref, {
      userId,
      mood,
      trackTitle,
      startTime: serverTimestamp(),
      endTime: null,
      durationMinutes: null,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("[sessionService] startSession error:", err);
    return null;
  }
}

/**
 * End a session – updates the document with endTime and duration.
 * @param {string} docId
 * @param {number} durationMinutes
 */
export async function endSession(docId, durationMinutes) {
  try {
    const ref = doc(db, SESSIONS_COLLECTION, docId);
    await updateDoc(ref, {
      endTime: serverTimestamp(),
      durationMinutes,
    });
  } catch (err) {
    console.error("[sessionService] endSession error:", err);
  }
}

/**
 * Fetch all sessions for a user, sorted by newest first.
 * @returns {Array} array of session objects with id field
 */
export async function getSessions(userId) {
  try {
    const ref = collection(db, SESSIONS_COLLECTION);
    const q = query(
      ref,
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings for easy rendering
          startTime: data.startTime instanceof Timestamp
            ? data.startTime.toDate().toISOString()
            : data.startTime,
          endTime: data.endTime instanceof Timestamp
            ? data.endTime.toDate().toISOString()
            : data.endTime,
        };
      })
      .filter((s) => s.userId === userId);
  } catch (err) {
    console.error("[sessionService] getSessions error:", err);
    return [];
  }
}
