import React, { useState } from 'react';
import MoodSelector from '../components/MoodSelector';
import MoodSubmitButton from '../components/MoodSubmitButton';
import { MOOD_CONFIG } from '../components/MoodEmojiOption';

// ── Custom palette ──────────────────────────────────────────────
// #B6B4BB · #8F8BB6 · #585296 · #3C436B · #272D3E
// ───────────────────────────────────────────────────────────────

const MoodInputPage = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    const selectedConfig = MOOD_CONFIG.find((m) => m.value === selectedMood);

    const handleConfirm = () => {
        if (selectedMood !== null) setConfirmed(true);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #272D3E 0%, #3C436B 35%, #585296 65%, #8F8BB6 100%)' }}
        >
            {/* Decorative blobs — tinted with palette colours */}
            <div
                className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30"
                style={{ backgroundColor: '#8F8BB6' }}
            />
            <div
                className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: '#B6B4BB' }}
            />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none opacity-10"
                style={{ backgroundColor: '#585296' }}
            />

            {/* Floating music notes */}
            <span className="absolute top-16 right-24 text-white/10 text-7xl select-none pointer-events-none animate-bounce" style={{ animationDuration: '3s' }}>♪</span>
            <span className="absolute bottom-20 left-20 text-white/10 text-5xl select-none pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>♫</span>
            <span className="absolute top-1/3 right-1/4 text-white/5 text-9xl select-none pointer-events-none">♩</span>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md">
                <div
                    className="backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center gap-8"
                    style={{ backgroundColor: 'rgba(39, 45, 62, 0.55)' }}
                >
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                            Mood Input
                        </h1>
                        <p className="mt-2 text-white/60 text-sm">
                            How are you feeling today?
                        </p>
                    </div>

                    {/* Mood Selector */}
                    <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />

                    {/* Selected mood label */}
                    {selectedConfig && !confirmed && (
                        <div className="flex items-center gap-2 border border-white/20 rounded-full px-5 py-2"
                            style={{ backgroundColor: 'rgba(182,180,187,0.12)' }}>
                            <span className="text-xl">{selectedConfig.emoji}</span>
                            <span className="text-white/80 font-medium text-sm">
                                You're feeling{' '}
                                <span className="font-bold text-white">{selectedConfig.label}</span>
                            </span>
                        </div>
                    )}

                    {/* Confirmation message */}
                    {confirmed && selectedConfig && (
                        <div
                            className="flex flex-col items-center gap-1 border border-white/20 rounded-2xl px-6 py-4 text-center"
                            style={{ backgroundColor: 'rgba(88,82,150,0.25)' }}
                        >
                            <span className="text-3xl">{selectedConfig.emoji}</span>
                            <p className="text-white font-semibold text-sm mt-1">
                                Mood confirmed!
                            </p>
                            <p className="text-white/60 text-xs">
                                Your <span className="font-bold text-white">{selectedConfig.label}</span> mood has been recorded.
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    {!confirmed && (
                        <MoodSubmitButton onClick={handleConfirm} disabled={selectedMood === null} />
                    )}

                    {/* Re-select after confirming */}
                    {confirmed && (
                        <button
                            onClick={() => { setConfirmed(false); setSelectedMood(null); }}
                            className="text-white/50 text-sm underline underline-offset-2 hover:text-white transition-colors"
                        >
                            Change mood
                        </button>
                    )}

                    {/* Note */}
                    <p className="text-white/40 text-xs text-center">
                        <span className="font-semibold text-white/60">Note:</span> You can select your mood once per day.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MoodInputPage;
