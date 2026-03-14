import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodSelector from '../components/MoodSelector';
import MoodSubmitButton from '../components/MoodSubmitButton';
import { MOOD_CONFIG } from '../components/MoodEmojiOption';

// ── Professional Palette ─────────────────────────────────────────
// Background: #272D3E | Surface: #3C436B | Primary: #585296
// Highlight: #8F8BB6  | Text: #B6B4BB
// ───────────────────────────────────────────────────────────────

const MoodInputPage = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const navigate = useNavigate();

    const selectedConfig = MOOD_CONFIG.find((m) => m.value === selectedMood);

    const handleConfirm = () => {
        if (selectedMood !== null) {
            navigate('/mood-recommendation', { state: { mood: selectedConfig } });
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ backgroundColor: '#272D3E' }}
        >
            {/* Decorative blobs — using palette highlights */}
            <div
                className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: '#8F8BB6' }}
            />
            <div
                className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
                style={{ backgroundColor: '#585296' }}
            />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none opacity-5"
                style={{ backgroundColor: '#B6B4BB' }}
            />

            {/* Floating music notes */}
            <span className="absolute top-16 right-24 text-white/5 text-7xl select-none pointer-events-none animate-bounce" style={{ animationDuration: '3s' }}>♪</span>
            <span className="absolute bottom-20 left-20 text-white/5 text-5xl select-none pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>♫</span>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md">
                <div
                    className="border border-white/10 rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center gap-8"
                    style={{ backgroundColor: '#3C436B' }}
                >
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg" style={{ color: '#B6B4BB' }}>
                            Mood Input
                        </h1>
                        <p className="mt-2 text-sm opacity-80" style={{ color: '#B6B4BB' }}>
                            How are you feeling today?
                        </p>
                    </div>

                    {/* Mood Selector */}
                    <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />

                    {/* Selected mood label */}
                    {selectedConfig && (
                        <div className="flex items-center gap-2 border border-white/20 rounded-full px-5 py-2"
                            style={{ backgroundColor: 'rgba(182,180,187,0.12)' }}>
                            <span className="text-xl">{selectedConfig.emoji}</span>
                            <span className="text-white/80 font-medium text-sm">
                                You're feeling{' '}
                                <span className="font-bold text-white">{selectedConfig.label}</span>
                            </span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <MoodSubmitButton onClick={handleConfirm} disabled={selectedMood === null} />

                    {/* Note */}
                    <p className="text-xs text-center opacity-60" style={{ color: '#B6B4BB' }}>
                        <span className="font-semibold">Note:</span> You can select your mood once per day.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MoodInputPage;
