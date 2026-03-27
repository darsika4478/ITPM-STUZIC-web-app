import React from 'react';

const getPlaylistName = (moodValue) => {
    switch (moodValue) {
        case 1: return "Calm Ambience Playlist";
        case 2: return "Relaxed Study Playlist";
        case 3: return "Study Focus Playlist";
        case 4: return "Upbeat Motivation Playlist";
        case 5: return "Positive Energy Playlist";
        default: return "Study Focus Playlist";
    }
};

const MOOD_HISTORY_DATA = [
    {
        id: 1,
        date: 'April 23',
        moodEmoji: '😃',
        moodValue: 4
    },
    {
        id: 2,
        date: 'April 22',
        moodEmoji: '😄',
        moodValue: 5
    },
    {
        id: 3,
        date: 'April 21',
        moodEmoji: '🙁',
        moodValue: 2
    }
];

const MoodHistoryPage = () => {
    return (
        <div className="relative w-full h-full min-h-[calc(100vh-4rem)] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center pt-10 px-4 md:px-12 z-0 font-sans">

            {/* Animated Background Container */}
            <div className="absolute inset-0 -z-10 bg-transparent">

                {/* CSS Stars */}
                <div className="stars-container absolute inset-0 overflow-hidden pointer-events-none opacity-60">
                    {/* Generative twinkling stars simulation via pure CSS boxes or small SVGs */}
                    <div className="absolute top-[10%] left-[20%] w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-70" style={{ animationDuration: '3s' }} />
                    <div className="absolute top-[30%] left-[80%] w-2 h-2 bg-white rounded-full animate-pulse opacity-50" style={{ animationDuration: '4s' }} />
                    <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white rounded-full animate-ping opacity-80" style={{ animationDuration: '2.5s' }} />
                    <div className="absolute top-[50%] left-[60%] w-[10px] h-[10px] bg-white rounded-full animate-pulse opacity-40 blur-[1px]" style={{ animationDuration: '5s' }} />
                    <div className="absolute top-[20%] left-[70%] text-white opacity-40 text-sm animate-pulse">✨</div>
                    <div className="absolute top-[40%] left-[30%] text-white opacity-30 text-xs animate-ping">✨</div>
                </div>

                {/* SVG Animated Waves targeting the bottom */}
                <svg className="absolute w-full h-[50%] bottom-0 left-0 opacity-40 wave-svg animate-wave-slow pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#8F8BB6" fillOpacity="0.8" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,213.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
                <svg className="absolute w-full h-[60%] bottom-0 left-0 opacity-20 wave-svg animate-wave-fast pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#B6B4BB" fillOpacity="0.5" d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,245.3C840,245,960,203,1080,197.3C1200,192,1320,224,1380,240L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>

            {/* Header Content */}
            <div className="w-full max-w-4xl flex justify-start mb-8 z-10">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-wide text-white drop-shadow-md">
                    Mood History
                </h1>
            </div>

            {/* Glassmorphic Table Wrapper */}
            <div className="w-full max-w-4xl rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-md bg-white/10 z-10 overflow-hidden">

                {/* Table Header Wrapper */}
                <div className="grid grid-cols-[1fr_1fr_3fr] md:grid-cols-[20%_20%_60%] px-6 py-4 border-b border-white/10 text-[#f0ecff] font-semibold text-sm md:text-base tracking-wide bg-gradient-to-r from-white/5 to-transparent">
                    <div className="text-center md:text-left">Date</div>
                    <div className="text-center">Mood</div>
                    <div className="text-left pl-4">Description</div>
                </div>

                {/* Table Body Content */}
                <div className="flex flex-col">
                    {MOOD_HISTORY_DATA.map((item, index) => (
                        <div
                            key={item.id}
                            className={`
                                grid grid-cols-[1fr_1fr_3fr] md:grid-cols-[20%_20%_60%] items-center 
                                px-6 py-5 md:py-6 transition-colors duration-200 
                                hover:bg-white/5
                                ${index !== MOOD_HISTORY_DATA.length - 1 ? 'border-b border-white/10' : ''}
                            `}
                        >
                            {/* Date */}
                            <div className="text-[#f0ecff] text-xs md:text-sm font-medium tracking-wider text-center md:text-left">
                                {item.date}
                            </div>

                            {/* Center Mood Emoji */}
                            <div className="flex justify-center">
                                <span className="text-3xl md:text-4xl drop-shadow-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                    {item.moodEmoji}
                                </span>
                            </div>

                            {/* Description Block */}
                            <div className="flex items-center justify-start pl-4 pr-2">
                                <div className="flex flex-col gap-0.5 md:gap-1">
                                    <span className="text-[#f0ecff] font-semibold text-sm md:text-base tracking-wide">
                                        Mood level {item.moodValue} <span className="text-[#c4b5fd] font-normal text-xs md:text-sm">— {getPlaylistName(item.moodValue)}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scoped CSS for wave animations */}
            <style>{`
                @keyframes move-wave-slow {
                    0% { transform: translateX(0) scaleY(1); }
                    50% { transform: translateX(-5%) scaleY(1.05); }
                    100% { transform: translateX(0) scaleY(1); }
                }
                @keyframes move-wave-fast {
                    0% { transform: translateX(-2%) scaleY(1.1); }
                    50% { transform: translateX(3%) scaleY(0.95); }
                    100% { transform: translateX(-2%) scaleY(1.1); }
                }
                .animate-wave-slow {
                    animation: move-wave-slow 15s ease-in-out infinite alternate;
                    transform-origin: bottom center;
                }
                .animate-wave-fast {
                    animation: move-wave-fast 10s ease-in-out infinite alternate;
                    transform-origin: bottom center;
                }
            `}</style>
        </div>
    );
};

export default MoodHistoryPage;
