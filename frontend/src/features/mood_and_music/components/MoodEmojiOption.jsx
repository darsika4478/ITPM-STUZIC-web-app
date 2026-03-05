import React from 'react';

// Palette: 1→#B6B4BB · 2→#8F8BB6 · 3→#585296 · 4→#3C436B · 5→#272D3E
const MOOD_CONFIG = [
    { value: 1, emoji: '😢', label: 'Sad', bg: '#B6B4BB' },
    { value: 2, emoji: '😕', label: 'Low', bg: '#8F8BB6' },
    { value: 3, emoji: '😐', label: 'Neutral', bg: '#585296' },
    { value: 4, emoji: '🙂', label: 'Good', bg: '#3C436B' },
    { value: 5, emoji: '😄', label: 'Happy', bg: '#272D3E' },
];

const MoodEmojiOption = ({ mood, selected, onSelect }) => {
    const config = MOOD_CONFIG.find((m) => m.value === mood);
    const isSelected = selected === mood;

    return (
        <button
            onClick={() => onSelect(mood)}
            className="relative flex flex-col items-center gap-2 focus:outline-none transition-all duration-300"
        >
            {/* Emoji bubble */}
            <div
                style={{ backgroundColor: config.bg }}
                className={`
                    relative flex items-center justify-center rounded-full text-4xl
                    transition-all duration-300 ease-out
                    ${isSelected
                        ? 'w-20 h-20 -translate-y-4 shadow-2xl ring-4 ring-white/50 scale-110'
                        : 'w-16 h-16 hover:scale-105 hover:-translate-y-1'
                    }
                `}
            >
                {config.emoji}
                {/* Shine overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
            </div>

            {/* Number label */}
            <span className={`text-xs font-bold transition-colors duration-200 ${isSelected ? 'text-white' : 'text-white/50'}`}>
                {mood}
            </span>

            {/* Selected dot */}
            {isSelected && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white animate-pulse shadow-lg" />
            )}
        </button>
    );
};

export { MOOD_CONFIG };
export default MoodEmojiOption;
