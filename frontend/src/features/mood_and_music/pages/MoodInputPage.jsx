import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import MoodSelector from '../components/MoodSelector';
import MoodSubmitButton from '../components/MoodSubmitButton';
import { MOOD_CONFIG } from '../components/MoodEmojiOption';
import { onAuthStateChanged } from 'firebase/auth';

// ── Professional Palette ─────────────────────────────────────────
// Background: transparent (inherited) | Surface: #3C436B | Primary: #585296
// Highlight: #8F8BB6  | Text: #B6B4BB
// ───────────────────────────────────────────────────────────────

const MoodInputPage = () => {
    const navigate = useNavigate();
    const defaultFormData = {
        genre: '',
        energy: '',
        activity: '',
        vocals: '',
        focusTime: '',
        artist: ''
    };

    // Form State for 6 fields
    const [selectedMood, setSelectedMood] = useState(null);
    const [formData, setFormData] = useState(defaultFormData);
    const [showErrors, setShowErrors] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const [existingMoodEntry, setExistingMoodEntry] = useState(null);
    const [isLoadingEntry, setIsLoadingEntry] = useState(true);
    const [isEditMode, setIsEditMode] = useState(true);

    const resetForm = () => {
        setSelectedMood(null);
        setFormData(defaultFormData);
        setShowErrors(false);
        setSaveError('');
    };

    const getTodayId = () => new Date().toISOString().slice(0, 10);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        resetForm();
        const handlePageShow = (event) => {
            if (event.persisted) {
                resetForm();
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setExistingMoodEntry(null);
            setIsLoadingEntry(false);
            return;
        }

        const loadExistingMood = async () => {
            const docId = `${currentUser.uid}_${getTodayId()}`;
            setIsLoadingEntry(true);

            try {
                const snapshot = await getDoc(doc(db, 'moodEntries', docId));
                if (snapshot.exists()) {
                    const entry = snapshot.data();
                    setExistingMoodEntry({ id: snapshot.id, ...entry });
                    setSelectedMood(entry.moodValue || null);
                    setFormData({
                        genre: entry.preferences?.genre || '',
                        energy: entry.preferences?.energy ? String(entry.preferences.energy) : '',
                        activity: entry.preferences?.activity || '',
                        vocals: entry.preferences?.vocals || '',
                        focusTime: entry.preferences?.focusTime ? String(entry.preferences.focusTime) : '',
                        artist: entry.preferences?.artist || ''
                    });
                    setIsEditMode(false);
                } else {
                    setExistingMoodEntry(null);
                    setIsEditMode(true);
                }
            } catch (error) {
                console.error('Failed to load today mood entry:', error);
            } finally {
                setIsLoadingEntry(false);
            }
        };

        loadExistingMood();
    }, [currentUser]);

    const selectedConfig = MOOD_CONFIG.find((m) => m.value === selectedMood);

    // Validate Focus Time
    const getFocusTimeError = () => {
        const val = formData.focusTime;
        if (val === '') return "Please enter focus time";
        const num = Number(val);
        if (isNaN(num)) return "Focus time must be a number";
        if (num <= 0) return "Focus time must be greater than 0";
        if (num < 10 || num > 180) return "Focus time must be between 10 and 180 minutes";
        return null;
    };

    const focusError = getFocusTimeError();

    // Validate Artist
    const getArtistError = () => {
        let val = formData.artist;
        if (!val) return null;
        val = val.trim();
        if (val.length === 0) return null; // If just spaces, treat as empty (optional)
        if (val.length < 4) return "Artist name must be at least 4 characters";
        if (val.length > 50) return "Artist name must be less than 50 characters";
        if (!/^[a-zA-Z0-9 ]+$/.test(val)) return "Only letters, numbers, and spaces are allowed";
        return null;
    };

    const artistError = getArtistError();

    // Check if the form is fully valid (Mood + all 5 extra required fields + optional valid artist)
    const isFormValid = selectedMood !== null &&
        formData.genre !== '' &&
        (formData.energy !== '' && Number(formData.energy) >= 1 && Number(formData.energy) <= 5) &&
        formData.activity !== '' &&
        formData.vocals !== '' &&
        focusError === null &&
        artistError === null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Optionally clear errors when they start typing/selecting
        if (showErrors) setShowErrors(false);
    };

    const handleConfirm = async () => {
        if (!isFormValid) {
            setShowErrors(true);
            return;
        }

        if (!currentUser) {
            setSaveError('Unable to save mood. Please sign in again.');
            return;
        }

        setIsSaving(true);
        setSaveError('');

        const today = new Date().toISOString().slice(0, 10);
        const moodPayload = {
            userId: currentUser.uid,
            date: today,
            moodValue: selectedMood,
            moodLabel: selectedConfig?.label || '',
            moodEmoji: selectedConfig?.emoji || '',
            preferences: {
                genre: formData.genre,
                energy: Number(formData.energy),
                activity: formData.activity,
                vocals: formData.vocals,
                focusTime: Number(formData.focusTime),
                artist: formData.artist.trim() || null,
            },
            recordedAt: serverTimestamp(),
        };

        try {
            const docId = `${currentUser.uid}_${today}`;
            await setDoc(doc(db, 'moodEntries', docId), moodPayload, { merge: true });
            navigate('/dashboard/mood-recommendation', {
                state: {
                    mood: selectedConfig,
                    preferences: formData
                }
            });
        } catch (error) {
            console.error('Failed to save mood entry:', error);
            const code = error?.code || '';
            const message = error?.message || '';

            if (code === 'permission-denied') {
                setSaveError(
                    'Permission denied. Please verify your Firebase Firestore rules are deployed and that you are signed in to the correct Firebase project.'
                );
            } else {
                setSaveError(
                    `Could not save mood to Firebase. ${code ? `(${code}) ` : ''}${message}`.trim() ||
                    'Could not connect to Firebase. Please try again.'
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const inputClasses = (isInvalid) => `w-full bg-black/10 border ${isInvalid && showErrors ? 'border-red-400/80 ring-1 ring-red-400/50' : 'border-white/10 focus:border-[#8F8BB6] focus:ring-[#8F8BB6]'} rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-1 transition-all text-sm`;
    const labelClasses = "block text-xs font-semibold mb-1.5 opacity-90";

    const ErrorMsg = ({ condition, msg }) => {
        if (!showErrors || condition) return null;
        return <span className="text-red-400 text-xs mt-1.5 ml-1 font-medium block animate-fade-in">{msg}</span>;
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden bg-transparent py-10">
            {/* Decorative blobs */}
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: '#8F8BB6' }} />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10" style={{ backgroundColor: '#585296' }} />

            {/* Floating music notes */}
            <span className="absolute top-16 right-24 text-white/5 text-7xl select-none pointer-events-none animate-bounce" style={{ animationDuration: '3s' }}>♪</span>
            <span className="absolute bottom-20 left-20 text-white/5 text-5xl select-none pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>♫</span>

            {/* Form Container (Removed explicit inner scrollbar to let the page scroll naturally) */}
            <div className="relative z-10 w-full max-w-2xl px-4">
                <div
                    className="border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-8 back"
                    style={{ backgroundColor: '#3C436B' }}
                >
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg" style={{ color: '#B6B4BB' }}>
                            Your Music Profile
                        </h1>
                        <p className="mt-2 text-sm opacity-80" style={{ color: '#B6B4BB' }}>
                            Tell us how you're feeling and what you want to hear.
                        </p>
                    </div>

                    {isLoadingEntry ? (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/80">
                            Checking whether today&apos;s mood has already been recorded...
                        </div>
                    ) : existingMoodEntry && !isEditMode ? (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
                            <p className="text-sm text-white/80">
                                You already recorded your mood for today. If you want to see personalized music, open your recommendation page.
                            </p>
                            <div className="grid gap-3 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard/mood-recommendation', {
                                        state: {
                                            mood: {
                                                value: existingMoodEntry.moodValue,
                                                emoji: existingMoodEntry.moodEmoji,
                                                label: existingMoodEntry.moodLabel
                                            }
                                        }
                                    })}
                                    className="rounded-2xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                                >
                                    View today&apos;s recommendation
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditMode(true);
                                        setExistingMoodEntry(null);
                                        resetForm();
                                    }}
                                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Update mood for today
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {!(existingMoodEntry && !isEditMode) && (
                        <>
                            {/* 1. Mood Selector */}
                            <div className="flex flex-col items-center">
                                <label className={`${labelClasses} text-center w-full`} style={{ color: '#B6B4BB' }}>1. Current Mood *</label>
                        <MoodSelector selectedMood={selectedMood} onMoodSelect={(val) => { setSelectedMood(val); if (showErrors) setShowErrors(false); }} />
                        <ErrorMsg condition={selectedMood !== null} msg="Please select your current mood." />
                        {selectedConfig && (
                            <div className="mt-4 flex items-center gap-2 border border-white/20 rounded-full px-5 py-2" style={{ backgroundColor: 'rgba(182,180,187,0.12)' }}>
                                <span className="text-xl">{selectedConfig.emoji}</span>
                                <span className="text-white/80 font-medium text-xs md:text-sm">
                                    You're feeling <span className="font-bold text-white">{selectedConfig.label}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="w-full h-px bg-white/10 my-2" />

                    {/* Grid for Selects */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                        {/* 2. Preferred Genre */}
                        <div>
                            <label htmlFor="genre" className={labelClasses} style={{ color: '#B6B4BB' }}>2. Preferred Genre *</label>
                            <select id="genre" name="genre" value={formData.genre} onChange={handleInputChange} className={inputClasses(formData.genre === '')}>
                                <option value="" disabled className="text-black">Select a genre...</option>
                                <option value="pop" className="text-black">Pop</option>
                                <option value="rock" className="text-black">Rock & Alternative</option>
                                <option value="classical" className="text-black">Classical & Instrumental</option>
                                <option value="lofi" className="text-black">Lofi Beats</option>
                                <option value="electronic" className="text-black">Electronic / Dance</option>
                                <option value="rb" className="text-black">R&B / Soul</option>
                            </select>
                            <ErrorMsg condition={formData.genre !== ''} msg="Genre is required." />
                        </div>

                        {/* 3. Energy Level */}
                        <div>
                            <label htmlFor="energy" className={labelClasses} style={{ color: '#B6B4BB' }}>3. Energy Level (1-5) *</label>
                            <input
                                type="number"
                                id="energy"
                                name="energy"
                                min="1"
                                max="5"
                                placeholder="Enter a value from 1 to 5"
                                value={formData.energy}
                                onChange={handleInputChange}
                                className={inputClasses(formData.energy === '' || Number(formData.energy) < 1 || Number(formData.energy) > 5)}
                            />
                            <ErrorMsg condition={formData.energy !== '' && Number(formData.energy) >= 1 && Number(formData.energy) <= 5} msg="mood must be between 1 and 5" />
                        </div>

                        {/* 4. Current Activity */}
                        <div>
                            <label htmlFor="activity" className={labelClasses} style={{ color: '#B6B4BB' }}>4. Current Activity *</label>
                            <select id="activity" name="activity" value={formData.activity} onChange={handleInputChange} className={inputClasses(formData.activity === '')}>
                                <option value="" disabled className="text-black">What are you doing?</option>
                                <option value="studying" className="text-black">Studying / Focus</option>
                                <option value="workingout" className="text-black">Working Out</option>
                                <option value="commuting" className="text-black">Commuting</option>
                                <option value="relaxing" className="text-black">Relaxing</option>
                            </select>
                            <ErrorMsg condition={formData.activity !== ''} msg="Activity is required." />
                        </div>

                        {/* 5. Vocal Preference */}
                        <div>
                            <label htmlFor="vocals" className={labelClasses} style={{ color: '#B6B4BB' }}>5. Vocals *</label>
                            <select id="vocals" name="vocals" value={formData.vocals} onChange={handleInputChange} className={inputClasses(formData.vocals === '')}>
                                <option value="" disabled className="text-black">Vocal preference...</option>
                                <option value="vocals" className="text-black">Must have vocals</option>
                                <option value="instrumental" className="text-black">Instrumental only</option>
                                <option value="any" className="text-black">No preference</option>
                            </select>
                            <ErrorMsg condition={formData.vocals !== ''} msg="Vocal preference is required." />
                        </div>

                        {/* 6. Focus Time */}
                        <div className="md:col-span-2 lg:col-span-2">
                            <label htmlFor="focusTime" className={labelClasses} style={{ color: '#B6B4BB' }}>6. How long can you stay focused? (minutes) *</label>
                            <input
                                type="number"
                                id="focusTime"
                                name="focusTime"
                                placeholder="Enter minutes (e.g. 30)"
                                value={formData.focusTime}
                                onChange={handleInputChange}
                                className={inputClasses(focusError !== null)}
                            />
                            {showErrors && focusError && (
                                <span className="text-red-400 text-xs mt-1.5 ml-1 font-medium block animate-fade-in">{focusError}</span>
                            )}
                        </div>

                    </div>

                    {/* 7. Favorite Artist (Optional) */}
                    <div className="w-full">
                        <label htmlFor="artist" className={labelClasses} style={{ color: '#B6B4BB' }}>7. Favorite Artist <span className="opacity-50 font-normal">(Optional)</span></label>
                        <input
                            type="text"
                            id="artist"
                            name="artist"
                            placeholder="e.g. Taylor Swift, The Weeknd, Hans Zimmer..."
                            value={formData.artist}
                            onChange={handleInputChange}
                            className={inputClasses(artistError !== null)}
                        />
                        {showErrors && artistError && (
                            <span className="text-red-400 text-xs mt-1.5 ml-1 font-medium block animate-fade-in">{artistError}</span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col items-center mt-4">
                        <MoodSubmitButton
                            onClick={handleConfirm}
                            disabled={isSaving || !currentUser}
                        />
                        {saveError && (
                            <p className="text-sm text-red-300 text-center mt-3">{saveError}</p>
                        )}
                        <p className="text-xs text-center opacity-60 mt-4" style={{ color: '#B6B4BB' }}>
                            <span className="font-semibold">*</span> Required fields
                        </p>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoodInputPage;
