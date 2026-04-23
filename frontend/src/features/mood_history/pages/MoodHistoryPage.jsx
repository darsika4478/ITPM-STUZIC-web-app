import React, { useEffect, useState } from 'react';
import { auth } from '../../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import * as moodService from '../../../firebase/moodService';

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

const getEmojiForValue = (moodValue) => {
    switch (moodValue) {
        case 1: return "😢";
        case 2: return "😕";
        case 3: return "😐";
        case 4: return "🙂";
        case 5: return "😄";
        default: return "😐";
    }
};

const MoodHistoryPage = () => {
    const [moodHistory, setMoodHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const [displayedCount, setDisplayedCount] = useState(5);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setMoodHistory([]);
            setIsLoading(false);
            return;
        }

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await moodService.getMoodHistory(currentUser.uid);
                setMoodHistory(data);
            } catch (error) {
                console.error('Failed to fetch mood history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser]);

    const formatDate = (date) => {
        if (!date) return 'Unknown Date';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    };

    const displayedHistory = moodHistory.slice(0, displayedCount);
    const hasMoreEntries = moodHistory.length > displayedCount;

    const handleShowMore = () => {
        setDisplayedCount(prev => Math.min(prev + 5, moodHistory.length));
    };
    return (
        <div className="relative w-full h-full min-h-[calc(100vh-4rem)] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center pt-10 px-4 md:px-12 z-0 font-sans bg-linear-to-br from-[#1c1848] via-[#272d3e] to-[#1c1848]">

            {/* Animated Background Container */}
            <div className="absolute inset-0 -z-10 bg-transparent">

                {/* CSS Stars */}
                <div className="stars-container absolute inset-0 overflow-hidden pointer-events-none opacity-60">
                    {/* Generative twinkling stars simulation via pure CSS boxes or small SVGs */}
                    <div className="absolute top-[10%] left-[20%] w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-70" style={{ animationDuration: '3s' }} />
                    <div className="absolute top-[30%] left-[80%] w-2 h-2 bg-white rounded-full animate-pulse opacity-50" style={{ animationDuration: '4s' }} />
                    <div className="absolute top-[70%] left-[10%] w-1 h-1 bg-white rounded-full animate-ping opacity-80" style={{ animationDuration: '2.5s' }} />
                    <div className="absolute top-[50%] left-[60%] w-2.5 h-2.5 bg-white rounded-full animate-pulse opacity-40 blur-[1px]" style={{ animationDuration: '5s' }} />
                    <div className="absolute top-[20%] left-[70%] text-white opacity-40 text-sm animate-pulse">✨</div>
                    <div className="absolute top-[40%] left-[30%] text-white opacity-30 text-xs animate-ping">✨</div>
                </div>

                {/* SVG Animated Waves targeting the bottom */}
                <svg className="absolute w-full h-[50%] bottom-0 left-0 opacity-35 wave-svg animate-wave-slow pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#6d5fe7" fillOpacity="0.45" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,213.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
                <svg className="absolute w-full h-[60%] bottom-0 left-0 opacity-20 wave-svg animate-wave-fast pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#8F8BB6" fillOpacity="0.32" d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,245.3C840,245,960,203,1080,197.3C1200,192,1320,224,1380,240L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>

            {/* Header Content with Enhanced Styling */}
            <div className="w-full max-w-4xl flex flex-col gap-2 mb-8 z-10">
                <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-linear-to-r from-[#c4b5fd] via-[#f0ecff] to-[#a78bfa] drop-shadow-lg">
                    📊 Mood History
                </h1>
                <p className="text-sm text-[#b6b4bb]/80">Track your emotional journey over time</p>
            </div>

            {/* Glassmorphic Table Wrapper with Enhanced Styling */}
            <div className="w-full max-w-4xl rounded-3xl border border-[#6d5fe7]/20 shadow-[0_10px_32px_0_rgba(0,0,0,0.35)] backdrop-blur-xl bg-linear-to-br from-[#1c1848]/70 to-[#272d3e]/65 z-10 overflow-hidden transition-all duration-300">

                {/* Table Header Wrapper */}
                <div className="grid grid-cols-[1fr_1fr_3fr] md:grid-cols-[20%_20%_60%] px-6 md:px-8 py-5 border-b border-[#6d5fe7]/20 text-[#f0ecff] font-bold text-sm md:text-base tracking-widest bg-linear-to-r from-[#6d5fe7]/25 via-transparent to-transparent">
                    <div className="text-center md:text-left">📅 Date</div>
                    <div className="text-center">😊 Mood</div>
                    <div className="text-left pl-4">✨ Details</div>
                </div>

                {/* Table Body Content */}
                <div className="flex flex-col">
                    {isLoading ? (
                        <div className="px-6 md:px-8 py-12 text-center text-[#f0ecff] animate-pulse">
                            <div className="flex items-center justify-center gap-2">
                                <span className="inline-block w-2 h-2 bg-[#a78bfa] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                <span className="inline-block w-2 h-2 bg-[#a78bfa] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="inline-block w-2 h-2 bg-[#a78bfa] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            </div>
                            <p className="mt-3">Loading your mood journey...</p>
                        </div>
                    ) : displayedHistory.length === 0 ? (
                        <div className="px-6 md:px-8 py-12 text-center">
                            <div className="text-5xl mb-3">🌱</div>
                            <p className="text-[#f0ecff]/75 text-sm md:text-base">No mood entries found. Start by recording your mood!</p>
                        </div>
                    ) : (
                        displayedHistory.map((item, index) => (
                            <div
                                key={item.id}
                                className={`
                                    grid grid-cols-[1fr_1fr_3fr] md:grid-cols-[20%_20%_60%] items-center 
                                    px-6 md:px-8 py-6 md:py-7 transition-all duration-200 
                                    hover:bg-[#6d5fe7]/12 hover:shadow-md hover:scale-[1.01]
                                    ${index !== displayedHistory.length - 1 ? 'border-b border-white/8' : ''}
                                    ${index % 2 === 0 ? 'bg-[#1c1848]/25' : 'bg-transparent'}
                                `}
                            >
                                {/* Date */}
                                <div className="text-xs md:text-sm font-semibold tracking-wider text-center md:text-left bg-linear-to-r from-[#c4b5fd] to-transparent bg-clip-text text-transparent">
                                    {formatDate(item.recordedAt || item.createdAt || item.date)}
                                </div>

                                {/* Center Mood Emoji with Glow */}
                                <div className="flex justify-center">
                                    <span className="text-4xl md:text-5xl filter drop-shadow-[0_4px_8px_rgba(109,95,231,0.35)] hover:scale-125 transition-transform duration-200">
                                        {item.moodEmoji || getEmojiForValue(item.mood || item.moodValue)}
                                    </span>
                                </div>

                                {/* Description Block */}
                                <div className="flex items-center justify-start pl-4 pr-2">
                                    <div className="flex flex-col gap-1 md:gap-2">
                                        <span className="text-[#f0ecff] font-bold text-sm md:text-base tracking-wide">
                                            Mood level {item.mood || item.moodValue} <span className="text-[#c4b5fd] font-normal text-xs md:text-sm">— {getPlaylistName(item.mood || item.moodValue)}</span>
                                        </span>
                                        {(item.preferences?.activity || item.activity) && (
                                            <span className="text-[#b6b4bb]/70 text-[10px] md:text-xs flex items-center gap-1">
                                                <span>🎯</span> Doing: {item.preferences?.activity || item.activity}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Show More Button */}
                {hasMoreEntries && displayedHistory.length > 0 && (
                    <div className="px-6 md:px-8 py-6 border-t border-[#6d5fe7]/20 bg-linear-to-r from-[#6d5fe7]/12 to-transparent">
                        <button
                            onClick={handleShowMore}
                            className="w-full py-3 px-4 rounded-lg font-semibold text-sm md:text-base
                                bg-linear-to-r from-[#6d5fe7] to-[#4a3fa8] hover:from-[#7b6df1] hover:to-[#585296]
                                text-white shadow-lg shadow-[#1c1848]/50 hover:shadow-xl
                                transition-all duration-200 transform hover:scale-105 active:scale-95
                                flex items-center justify-center gap-2"
                        >
                            <span>📖 Show More...</span>
                            <span className="text-xs opacity-70">({moodHistory.length - displayedCount} more)</span>
                        </button>
                    </div>
                )}
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
