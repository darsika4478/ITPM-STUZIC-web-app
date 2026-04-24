// SongsPlayedSection.jsx – displays songs played during session as clean card items
import React from "react";

export default function SongsPlayedSection({ playedSongs = [], isSessionActive = false }) {
  if (!isSessionActive && playedSongs.length === 0) {
    return (
      <div className="w-full bg-[#3C436B] rounded-2xl border border-[#8F8BB6]/20 overflow-hidden shadow-lg">
        <h3 className="m-0 py-4 px-5 text-[15px] font-bold text-white border-b border-[#8F8BB6]/15 bg-linear-to-r from-[#3C436B] to-[#585296]/20 flex items-center gap-2">
          <span className="text-lg">♪</span>
          Songs Played
        </h3>
        <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-4xl opacity-30">🎵</div>
          <p className="text-[#8F8BB6] text-sm font-medium">
            No songs played yet
          </p>
          <p className="text-[#8F8BB6]/60 text-xs max-w-50">
            Start a session and songs will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#3C436B] rounded-2xl border border-[#8F8BB6]/20 overflow-hidden shadow-lg">
      <h3 className="m-0 py-4 px-5 text-[15px] font-bold text-white border-b border-[#8F8BB6]/15 bg-linear-to-r from-[#3C436B] to-[#585296]/20 flex items-center gap-2">
        <span className="text-lg">♪</span>
        Songs Played ({playedSongs.length})
      </h3>

      {playedSongs.length === 0 ? (
        <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="text-3xl opacity-20">🎵</div>
          <p className="text-[#8F8BB6] text-sm">No songs played yet</p>
        </div>
      ) : (
        <div className="flex flex-col max-h-100 overflow-y-auto">
          {playedSongs.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              className="flex items-start gap-3 p-4 border-b border-[#8F8BB6]/5 last:border-0 bg-transparent hover:bg-[#8F8BB6]/10 transition-colors duration-300 ease-out group"
            >
              {/* Order number / Music icon */}
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[#585296]/20 group-hover:bg-[#585296]/40 transition-colors duration-300">
                <span className="text-xs font-bold text-[#8F8BB6] group-hover:text-white transition-colors">
                  {song.order}
                </span>
              </div>

              {/* Song info */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-white truncate group-hover:text-[#C4BAE8] transition-colors">
                  {song.title}
                </p>
                <p className="text-xs text-[#8F8BB6] truncate">
                  {song.artist}
                </p>
              </div>

              {/* Timestamp */}
              <div className="shrink-0 text-xs text-[#8F8BB6]/70 group-hover:text-[#8F8BB6] transition-colors font-mono whitespace-nowrap">
                {song.playedAt}
              </div>

              {/* Play icon on hover */}
              <div className="shrink-0 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[#8F8BB6] text-lg">▶</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        /* Custom scrollbar styling */
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(143, 139, 182, 0.05);
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(143, 139, 182, 0.3);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(143, 139, 182, 0.5);
        }
      `}</style>
    </div>
  );
}
