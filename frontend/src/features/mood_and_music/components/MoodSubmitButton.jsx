import React from 'react';

// Primary: #585296 | Highlight: #8F8BB6 | Text: #B6B4BB
const MoodSubmitButton = ({ onClick, disabled, label = "Confirm Mood" }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative w-auto min-w-[14rem] py-3 px-8 rounded-full font-semibold text-base tracking-wide
                transition-all duration-300 ease-out z-20 flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
                ${disabled
                    ? 'opacity-40 cursor-not-allowed text-white/60'
                    : 'text-[#B6B4BB] shadow-lg hover:shadow-xl hover:scale-105 hover:brightness-110 active:scale-95'
                }
            `}
            style={disabled
                ? { background: 'rgba(88,82,150,0.3)' }
                : { background: 'linear-gradient(135deg, #585296 0%, #8F8BB6 100%)' }
            }
        >
            {/* Shine effect */}
            {!disabled && (
                <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <span className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-full" />
                </span>
            )}
            <span className="relative z-10 whitespace-nowrap">{label}</span>
        </button>
    );
};

export default MoodSubmitButton;
