import React from 'react';

// Palette:
// Text (light): #B6B4BB
// Primary buttons/active (line/dot): #585296
// Background (dark): #272D3E (used for the emoji's inset drop shadow)

const SelectedMoodDisplay = ({ moodEmoji, moodValue }) => {
    return (
        <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center pt-6 pb-12 relative animate-fade-in">
            {/* Top Text */}
            <h2
                className="text-lg font-medium mb-12 tracking-wide"
                style={{ color: '#B6B4BB' }}
            >
                Your selected mood...
            </h2>

            {/* Horizontal Line and Center Dot Container */}
            <div className="w-full relative flex items-center justify-center">

                {/* Connecting Line */}
                <div
                    className="absolute w-full h-[2px] rounded-full opacity-60"
                    style={{ backgroundColor: '#585296' }}
                />

                {/* Center Mood Bubble Wrapper (Cuts the line) */}
                <div
                    className="relative z-10 flex flex-col items-center justify-center px-4"
                    style={{ backgroundColor: 'transparent' }} // Let background flow through, or use the page bg `#272D3E` to fully cut line
                >
                    {/* The Bubble itself */}
                    <div
                        className="
                            relative flex items-center justify-center w-20 h-20 rounded-full text-5xl
                            shadow-2xl ring-4 ring-white/10 -translate-y-[28px] // Elevated above the line
                        "
                        style={{ backgroundColor: '#272D3E' }} // The dark background for the bubble
                    >
                        {moodEmoji}

                        {/* Shine overlay */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                        {/* Selected Indicator Dot below the emoji bubble */}
                        <span
                            className="absolute -bottom-2 w-2 h-2 rounded-full animate-pulse shadow-lg"
                            style={{ backgroundColor: '#585296' }}
                        />
                    </div>

                    {/* Number and Text Below the Line */}
                    <div className="absolute top-[32px] flex flex-col items-center mt-2">
                        <span className="text-sm font-bold" style={{ color: '#B6B4BB' }}>
                            {moodValue}
                        </span>
                        <span className="text-xs mt-1 whitespace-nowrap" style={{ color: '#B6B4BB' }}>
                            Your selected mood...
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectedMoodDisplay;
