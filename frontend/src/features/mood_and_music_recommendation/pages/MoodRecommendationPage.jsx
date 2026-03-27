import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SelectedMoodDisplay from '../components/SelectedMoodDisplay';
import PlaylistCard from '../components/PlaylistCard';

// ── Professional Palette ─────────────────────────────────────────
// Background: #272D3E | Surface: #3C436B | Primary: #585296
// Highlight: #8F8BB6  | Text: #B6B4BB
// ───────────────────────────────────────────────────────────────

const BACKGROUND_IMAGES = [
    // We'll use placeholder gradients mixed with CSS images for now since we don't have assets yet.
    // In a real app, these would be `bg-[url('...')]`
    null, // Default gradient card
    null, // Default gradient card
    null, // Default gradient card
    null  // Default gradient card
];

const MoodRecommendationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Default to 'Happy' if no state is passed
    const [moodData, setMoodData] = useState({ value: 5, emoji: '😄', label: 'Happy' });

    useEffect(() => {
        if (location.state && location.state.mood) {
            setMoodData(location.state.mood);
        }
    }, [location.state]);

    // Mock playlists based on the mood.
    const getRecommendations = (value) => {
        // Simple logic for returning mock playlists depending on mood value
        return [
            { id: 1, title: 'Study Focus', icon: '🎵' },
            { id: 2, title: 'Upbeat Motivation', icon: '🎧' },
            { id: 3, title: 'Positive Energy', icon: '✨' },
            { id: 4, title: 'Positive Energy', icon: '☀️' },
        ];
    };

    const recommendedPlaylists = getRecommendations(moodData.value);

    return (
        <div
            className="h-full min-h-[calc(100vh-4rem)] rounded-3xl flex flex-col p-4 md:p-8 lg:p-12 relative overflow-hidden bg-transparent"
        >

            {/* Decorative blobs for depth */}
            <div
                className="absolute top-20 right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: '#8F8BB6' }}
            />
            <div
                className="absolute bottom-1/4 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
                style={{ backgroundColor: '#585296' }}
            />

            {/* Floating Music Notes */}
            <span className="absolute top-1/4 left-1/4 text-white/5 text-6xl pointer-events-none -rotate-12 select-none">♪</span>
            <span className="absolute top-2/4 right-1/4 text-white/5 text-5xl pointer-events-none rotate-12 select-none">♫</span>

            <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col z-10">
                {/* Title */}
                <h1
                    className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-4 drop-shadow-md"
                    style={{ color: '#B6B4BB' }}
                >
                    Mood & Music Recommendation
                </h1>

                {/* Selected Mood Section */}
                <SelectedMoodDisplay moodEmoji={moodData.emoji} moodValue={moodData.value} />

                {/* Playlists Container */}
                <div className="mt-8 mb-16 px-4">
                    <div className="flex flex-wrap justify-center gap-6">
                        {recommendedPlaylists.map((playlist, index) => (
                            <PlaylistCard
                                key={playlist.id}
                                title={playlist.title}
                                defaultIcon={playlist.icon}
                                bgImageClass={BACKGROUND_IMAGES[index]}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MoodRecommendationPage;
