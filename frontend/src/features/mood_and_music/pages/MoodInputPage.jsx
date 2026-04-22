import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import MoodSelector from '../components/MoodSelector';
import MoodSubmitButton from '../components/MoodSubmitButton';
import { MOOD_CONFIG } from '../components/MoodEmojiOption';
import { auth, db } from '../../../config/firebase';

// ── Professional Palette ─────────────────────────────────────────
// Background: transparent (inherited) | Surface: #3C436B | Primary: #585296
// Highlight: #8F8BB6  | Text: #B6B4BB
// ───────────────────────────────────────────────────────────────

const MoodInputPage = () => {
    const navigate = useNavigate();

    // Form State for 6 fields
    const [selectedMood, setSelectedMood] = useState(null);
    const [formData, setFormData] = useState({
        genre: '',
        energy: '',
        activity: '',
        artist: '',
        vocals: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const selectedConfig = MOOD_CONFIG.find((m) => m.value === selectedMood);

    // Check if the form is fully valid (Mood + all 5 extra fields)
    const isFormValid = selectedMood !== null &&
        formData.genre !== '' &&
        formData.energy !== '' &&
        formData.activity !== '' &&
        formData.vocals !== '';
    // Note: Artist is optional if they just want recommendations without a specific seed, but let's make it all required for now, or just leave artist optional. We'll make artist optional.

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = async () => {
        if (!isFormValid || submitting) return;

        const user = auth.currentUser;
        if (!user) {
            setSubmitError('Please sign in again before saving your mood.');
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError('');

            await addDoc(collection(db, 'moods'), {
                userId: user.uid,
                moodValue: selectedConfig.value,
                moodLabel: selectedConfig.label,
                moodEmoji: selectedConfig.emoji,
                preferences: formData,
                activity: formData.activity,
                energy: formData.energy,
                createdAt: serverTimestamp(),
            });

            // Pass the entire structured payload to the recommendation engine
            navigate('/dashboard/mood-recommendation', {
                state: {
                    mood: selectedConfig,
                    preferences: formData
                }
            });
        } catch (error) {
            console.error('Failed to save mood entry:', error);
            setSubmitError('Could not save your mood right now. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses = "w-full bg-black/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#8F8BB6] focus:ring-1 focus:ring-[#8F8BB6] transition-all text-sm";
    const labelClasses = "block text-xs font-semibold mb-1.5 opacity-90";

    return (
        <div className="h-full min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden bg-transparent">
            {/* Decorative blobs */}
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: '#8F8BB6' }} />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10" style={{ backgroundColor: '#585296' }} />

            {/* Floating music notes */}
            <span className="absolute top-16 right-24 text-white/5 text-7xl select-none pointer-events-none animate-bounce" style={{ animationDuration: '3s' }}>♪</span>
            <span className="absolute bottom-20 left-20 text-white/5 text-5xl select-none pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>♫</span>

            {/* Scrollable Form Container */}
            <div className="relative z-10 w-full max-w-2xl max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar px-4 py-6">
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

                    {/* 1. Mood Selector */}
                    <div className="flex flex-col items-center">
                        <label className={`${labelClasses} text-center w-full`} style={{ color: '#B6B4BB' }}>1. Current Mood *</label>
                        <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
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
                            <select id="genre" name="genre" value={formData.genre} onChange={handleInputChange} className={inputClasses}>
                                <option value="" disabled className="text-black">Select a genre...</option>
                                <option value="pop" className="text-black">Pop</option>
                                <option value="rock" className="text-black">Rock & Alternative</option>
                                <option value="classical" className="text-black">Classical & Instrumental</option>
                                <option value="lofi" className="text-black">Lofi Beats</option>
                                <option value="electronic" className="text-black">Electronic / Dance</option>
                                <option value="rb" className="text-black">R&B / Soul</option>
                            </select>
                        </div>

                        {/* 3. Energy Level */}
                        <div>
                            <label htmlFor="energy" className={labelClasses} style={{ color: '#B6B4BB' }}>3. Energy Level *</label>
                            <select id="energy" name="energy" value={formData.energy} onChange={handleInputChange} className={inputClasses}>
                                <option value="" disabled className="text-black">Select energy level...</option>
                                <option value="low" className="text-black">Low (Chill, Relaxing)</option>
                                <option value="medium" className="text-black">Medium (Steady, Focus)</option>
                                <option value="high" className="text-black">High (Upbeat, Hype)</option>
                            </select>
                        </div>

                        {/* 4. Current Activity */}
                        <div>
                            <label htmlFor="activity" className={labelClasses} style={{ color: '#B6B4BB' }}>4. Current Activity *</label>
                            <select id="activity" name="activity" value={formData.activity} onChange={handleInputChange} className={inputClasses}>
                                <option value="" disabled className="text-black">What are you doing?</option>
                                <option value="studying" className="text-black">Studying / Focus</option>
                                <option value="workingout" className="text-black">Working Out</option>
                                <option value="commuting" className="text-black">Commuting</option>
                                <option value="relaxing" className="text-black">Relaxing</option>
                            </select>
                        </div>

                        {/* 5. Vocal Preference */}
                        <div>
                            <label htmlFor="vocals" className={labelClasses} style={{ color: '#B6B4BB' }}>5. Vocals *</label>
                            <select id="vocals" name="vocals" value={formData.vocals} onChange={handleInputChange} className={inputClasses}>
                                <option value="" disabled className="text-black">Vocal preference...</option>
                                <option value="vocals" className="text-black">Must have vocals</option>
                                <option value="instrumental" className="text-black">Instrumental only</option>
                                <option value="any" className="text-black">No preference</option>
                            </select>
                        </div>

                    </div>

                    {/* 6. Favorite Artist/Band (Optional) */}
                    <div className="w-full">
                        <label htmlFor="artist" className={labelClasses} style={{ color: '#B6B4BB' }}>6. Favorite Artist / Band <span className="opacity-50 font-normal">(Optional)</span></label>
                        <input
                            type="text"
                            id="artist"
                            name="artist"
                            placeholder="e.g. Taylor Swift, The Weeknd, Hans Zimmer..."
                            value={formData.artist}
                            onChange={handleInputChange}
                            className={inputClasses}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col items-center mt-4">
                        <MoodSubmitButton
                            onClick={handleConfirm}
                            disabled={!isFormValid || submitting}
                            label={submitting ? 'Saving...' : 'Get Recommendations'}
                        />
                        {submitError && (
                            <p className="text-xs text-red-300 text-center mt-3">{submitError}</p>
                        )}
                        <p className="text-xs text-center opacity-60 mt-4" style={{ color: '#B6B4BB' }}>
                            <span className="font-semibold">*</span> Required fields
                        </p>
                    </div>
                </div>
            </div>
            {/* Required CSS for custom scrollbar hidden internally if needed */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(143,139,182,0.3);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default MoodInputPage;
