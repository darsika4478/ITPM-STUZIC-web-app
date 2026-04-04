import {
  collection,
  setDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const MOOD_COLLECTION = "moods";

/**
 * Add a new mood entry to Firestore
 * @param {string} userId - User ID
 * @param {object} moodData - Mood data object
 */
export async function addMoodEntry(userId, moodData) {
  try {
    // We use a unique ID that starts with userId to satisfy potential security rules
    // but still allow multiple entries per day by adding a timestamp.
    const uniqueId = `${userId}_${Date.now()}`;
    const docRef = doc(db, MOOD_COLLECTION, uniqueId);
    
    const payload = {
      ...moodData,
      userId,
      date: new Date().toISOString().split("T")[0],
      recordedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };
    
    await setDoc(docRef, payload);
    console.log(`[moodService] Added mood entry: ${uniqueId}`);
    return uniqueId;
  } catch (err) {
    console.error("[moodService] addMoodEntry error:", err);
    throw err;
  }
}

/**
 * Fetch mood history for a specific user
 * @param {string} userId - User ID
 */
export async function getMoodHistory(userId) {
  try {
    const ref = collection(db, MOOD_COLLECTION);
    const q = query(
      ref,
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    
    const results = snapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.recordedAt || data.createdAt || data.date;
      return {
        id: doc.id,
        ...data,
        recordedAt: timestamp instanceof Timestamp 
          ? timestamp.toDate() 
          : timestamp ? new Date(timestamp) : new Date(0),
      };
    });

    // Sort descending by date
    return results.sort((a, b) => b.recordedAt - a.recordedAt);
  } catch (err) {
    console.error("[moodService] getMoodHistory error:", err);
    return [];
  }
}

/**
 * Fetch the most recent mood entry for today for a specific user
 * @param {string} userId - User ID
 */
export async function getTodayMood(userId) {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const ref = collection(db, MOOD_COLLECTION);
    const q = query(
      ref,
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    // Filter and sort in-memory to avoid composite index requirements
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      recordedAt: doc.data().recordedAt instanceof Timestamp 
        ? doc.data().recordedAt.toDate() 
        : doc.data().recordedAt ? new Date(doc.data().recordedAt) : new Date(0)
    }))
    .filter(entry => entry.date === todayStr)
    .sort((a, b) => b.recordedAt - a.recordedAt);
    
    return entries.length > 0 ? entries[0] : null;
  } catch (err) {
    console.error("[moodService] getTodayMood error:", err);
    return null;
  }
}
