import React from 'react';
import { useNavigate } from 'react-router-dom';

// Palette mapping for the card:
// Card Border / Sub-background: #8F8BB6 (Secondary highlight - used selectively)
// Gradient base for cards: from #3C436B to #585296
// Button: #585296 (Primary)
// Text: #B6B4BB (Light text)

const PlaylistCard = ({ title, bgImageClass, defaultIcon = "🎵" }) => {
    const navigate = useNavigate();
    return (
        <div
            className={`
                relative w-40 sm:w-48 h-56 rounded-2xl overflow-hidden shadow-xl
                flex flex-col items-center justify-end p-4 pt-10
                group cursor-pointer transition-transform hover:-translate-y-2 hover:shadow-2xl
                border border-white/10
            `}
            style={{
                // Default gradient if no background image class is provided
                background: bgImageClass ? 'none' : 'linear-gradient(180deg, rgba(60,67,107,0) 0%, rgba(88,82,150,0.9) 100%)',
                backgroundColor: bgImageClass ? 'transparent' : '#3C436B'
            }}
        >
            {/* If there's a background image, we assume it's passed as a Tailwind class (e.g., bg-[url(...)]) and handle the overlay */}
            {bgImageClass && (
                <>
                    <div className={`absolute inset-0 bg-cover bg-center ${bgImageClass}`} />
                    {/* Dark gradient overlay so text remains readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#272D3E] via-[#3C436B]/60 to-transparent" />
                </>
            )}

            {/* Icon / Empty State Graphic */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-5xl opacity-80 z-10 drop-shadow-md pb-4 pt-4">
                {!bgImageClass ? defaultIcon : null}
            </div>

            {/* Content area elevated above background/overlay */}
            <div className="relative z-20 flex flex-col items-center w-full mt-auto">
                <h3
                    className="font-bold text-center text-sm md:text-base mb-3 drop-shadow leading-tight px-1"
                    style={{ color: '#B6B4BB' }}
                >
                    {title}
                </h3>

                <button
                    onClick={() => navigate('/dashboard/music')}
                    className="
                        w-11/12 py-1.5 px-3 rounded-full text-xs font-semibold tracking-wide
                        transition-all duration-300 shadow-md backdrop-blur-sm
                        hover:scale-105 active:scale-95 border border-white/10
                    "
                    style={{
                        backgroundColor: 'rgba(88, 82, 150, 0.85)', // #585296 slightly transparent
                        color: 'white' // White pops better inside the button against #585296 than #B6B4BB
                    }}
                >
                    Start Listening
                </button>
            </div>

            {/* Subtle glow on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: '#B6B4BB' }}
            />
        </div>
    );
};

export default PlaylistCard;
