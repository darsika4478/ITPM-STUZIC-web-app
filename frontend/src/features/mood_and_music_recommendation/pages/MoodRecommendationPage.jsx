import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SelectedMoodDisplay from '../components/SelectedMoodDisplay';
import PlaylistCard from '../components/PlaylistCard';
import { getRecommendationSummary, createDiversePlaylist } from '../../../services/recommendationEngine';

// ── Professional Palette ─────────────────────────────────────────
// Background: #272D3E | Surface: #3C436B | Primary: #585296
// Highlight: #8F8BB6  | Text: #B6B4BB
// ───────────────────────────────────────────────────────────────

const BACKGROUND_IMAGES = [
    null, // Default gradient card
    null, // Default gradient card
    null, // Default gradient card
    null  // Default gradient card
];

const MoodRecommendationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Default to 'Happy' if no state is passed
    const [moodData, setMoodData] = useState({ value: 5, emoji: '😄', label: 'Happy', activity: 'studying' });
    const [recommendations, setRecommendations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state && location.state.mood) {
            const mood = location.state.mood;
            setMoodData({
                value: mood.value,
                emoji: mood.emoji,
                label: mood.label,
                activity: mood.activity || 'studying',
                energy: mood.energy || 3,
                genre: mood.genre,
                vocals: mood.vocals,
                focusTime: mood.focusTime
            });

            // Get recommendations
            setLoading(true);
            try {
                const preferences = {
                    genre: mood.genre,
                    vocals: mood.vocals,
                    focusTime: mood.focusTime,
                    energy: mood.energy
                };
                const summary = getRecommendationSummary(mood.value, mood.activity || 'studying', preferences);
                setRecommendations(summary.playlist);
                setStats(summary.stats);
            } catch (err) {
                console.error('Failed to get recommendations:', err);
            } finally {
                setLoading(false);
            }
        }
    }, [location.state]);

    const playTrack = (track) => {
        console.log('Playing track:', track);
        // Navigate to music player with the track and recommendations
        navigate('/music-player', {
            state: {
                track: track,
                playlist: recommendations,
                mood: moodData
            }
        });
    };

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

            <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col z-10">
                {/* Title */}
                <h1
                    className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-2 drop-shadow-md"
                    style={{ color: '#B6B4BB' }}
                >
                    Mood & Music Recommendation
                </h1>
                <p className="text-center text-sm mb-6" style={{ color: '#8F8BB6' }}>
                    Personalized recommendations based on your mood & preferences
                </p>

                {/* Selected Mood Section */}
                <SelectedMoodDisplay moodEmoji={moodData.emoji} moodValue={moodData.value} />

                {/* User Preferences Display */}
                {(moodData.activity || moodData.genre || moodData.vocals) && (
                    <div className="mt-6 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(88, 82, 150, 0.3)' }}>
                        <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#8F8BB6' }}>Your Preferences</p>
                        <div className="flex flex-wrap gap-2">
                            {moodData.activity && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10" style={{ color: '#B6B4BB' }}>
                                    Activity: {moodData.activity}
                                </span>
                            )}
                            {moodData.genre && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10" style={{ color: '#B6B4BB' }}>
                                    🎵 {moodData.genre}
                                </span>
                            )}
                            {moodData.vocals && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10" style={{ color: '#B6B4BB' }}>
                                    {moodData.vocals === 'instrumental' ? '🎼' : '🎤'} {moodData.vocals}
                                </span>
                            )}
                            {moodData.focusTime && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10" style={{ color: '#B6B4BB' }}>
                                    ⏱️ {moodData.focusTime}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Statistics */}
                {stats && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
                        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(88, 82, 150, 0.2)' }}>
                            <div className="text-2xl font-bold" style={{ color: '#B6B4BB' }}>{stats.totalTracksAvailable}</div>
                            <div className="text-xs mt-1" style={{ color: '#8F8BB6' }}>Tracks Available</div>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(88, 82, 150, 0.2)' }}>
                            <div className="text-2xl font-bold" style={{ color: '#B6B4BB' }}>{stats.genresAvailable}</div>
                            <div className="text-xs mt-1" style={{ color: '#8F8BB6' }}>Genres</div>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(88, 82, 150, 0.2)' }}>
                            <div className="text-lg font-bold" style={{ color: '#B6B4BB' }}>
                                {stats.topGenres.map(g => g.genre).join(', ')}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#8F8BB6' }}>Top Genres</div>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(88, 82, 150, 0.2)' }}>
                            <div className="text-lg font-bold" style={{ color: '#B6B4BB' }}>
                                {Math.floor(recommendations.reduce((t, r) => t + (r.duration || 0), 0) / 60)}m
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#8F8BB6' }}>Playlist Length</div>
                        </div>
                    </div>
                )}

                {/* Recommended Tracks */}
                <div className="mt-10 mb-16 px-4">
                    <h2 className="text-xl font-bold mb-6" style={{ color: '#B6B4BB' }}>
                        {loading ? '🎵 Loading recommendations...' : '✨ Your Top Recommendations'}
                    </h2>
                    
                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                            {recommendations.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="p-4 rounded-lg transition-all hover:scale-105 cursor-pointer"
                                    style={{ backgroundColor: 'rgba(88, 82, 150, 0.2)', border: '1px solid rgba(143, 139, 182, 0.3)' }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-1" 
                                                style={{ backgroundColor: 'rgba(143, 139, 182, 0.5)', color: '#B6B4BB' }}>
                                                #{index + 1}
                                            </div>
                                            <h3 className="font-bold text-sm mt-1" style={{ color: '#B6B4BB' }}>
                                                {track.title}
                                            </h3>
                                            <p className="text-xs mt-0.5" style={{ color: '#8F8BB6' }}>
                                                {track.artist}
                                            </p>
                                        </div>
                                        {track.score && (
                                            <div className="text-right">
                                                <div className="text-xs font-bold" style={{ color: '#585296' }}>
                                                    {track.score}%
                                                </div>
                                                <div className="w-8 h-1 mt-1 rounded-full bg-white/10">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{ 
                                                            width: `${track.score}%`,
                                                            backgroundColor: track.score > 70 ? '#8F8BB6' : '#585296'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3 mt-3">
                                        <span className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: 'rgba(88, 82, 150, 0.3)', color: '#8F8BB6' }}>
                                            🎵 {track.genre}
                                        </span>
                                        <span className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: 'rgba(88, 82, 150, 0.3)', color: '#8F8BB6' }}>
                                            {track.vocals === 'instrumental' ? '🎼' : '🎤'} {track.vocals}
                                        </span>
                                        <span className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: 'rgba(88, 82, 150, 0.3)', color: '#8F8BB6' }}>
                                            ⏱️ {Math.floor(track.duration / 60)}m
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => playTrack(track)}
                                            className="w-full py-2 rounded text-xs font-medium transition hover:shadow-lg"
                                            style={{ backgroundColor: 'rgba(143, 139, 182, 0.5)', color: 'white' }}
                                        >
                                            ▶ Play
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-sm" style={{ color: '#8F8BB6' }}>
                                {loading ? 'Getting recommendations for you...' : 'No recommendations available. Select a mood to get started!'}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MoodRecommendationPage;
