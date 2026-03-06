import React from 'react';

const DashboardHome = () => {
    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-white">Dashboard Overview</h1>
                <p className="text-sm text-white/60">Quick glance at your study tasks and progress.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: "Today's Tasks", value: '5' },
                    { label: 'Completed', value: '12' },
                    { label: 'Upcoming', value: '3' },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="rounded-2xl bg-[var(--c4)]/70 p-5 shadow-lg backdrop-blur"
                    >
                        <p className="text-sm text-white/70">{card.label}</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl bg-[var(--c4)]/60 p-6 text-white shadow-lg">
                <h2 className="text-lg font-semibold">Focus Today</h2>
                <p className="mt-2 text-sm text-white/70">
                    Plan your tasks, stay consistent, and keep your study streak alive.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/10 p-4">
                        <p className="text-sm text-white/70">Study Plan</p>
                        <p className="mt-1 text-base">Review module notes and practice quizzes.</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4">
                        <p className="text-sm text-white/70">Music Playlist</p>
                        <p className="mt-1 text-base">Lo-fi focus session, 45 minutes.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardHome;
