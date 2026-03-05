import React from 'react';

// Gradient uses palette: #8F8BB6 → #585296 → #3C436B
const MoodSubmitButton = ({ onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative w-52 py-3 px-8 rounded-full font-semibold text-base tracking-wide
                transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
                ${disabled
                    ? 'opacity-40 cursor-not-allowed text-white/60'
                    : 'text-white shadow-lg hover:shadow-xl hover:scale-105 hover:brightness-110 active:scale-95'
                }
            `}
            style={disabled
                ? { background: 'rgba(88,82,150,0.3)' }
                : { background: 'linear-gradient(135deg, #8F8BB6 0%, #585296 50%, #3C436B 100%)' }
            }
        >
            {/* Shine effect */}
            {!disabled && (
                <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <span className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-full" />
                </span>
            )}
            <span className="relative z-10">Confirm Mood</span>
        </button>
    );
};

export default MoodSubmitButton;
