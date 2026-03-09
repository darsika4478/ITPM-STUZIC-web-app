import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
    return (
        <div className="mx-auto max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-white">🏠 Dashboard Overview</h1>
                <p className="mt-1 text-[var(--c1)]">Quick glance at your study tasks and progress.</p>
            </div>

            {/* Stats Row */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                    { label: "Today's Tasks", value: '5', icon: '📅', color: 'text-amber-400' },
                    { label: 'Completed', value: '12', icon: '✅', color: 'text-green-400' },
                    { label: 'Upcoming', value: '3', icon: '⏳', color: 'text-blue-400' },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/8"
                    >
                        <span className="text-2xl">{card.icon}</span>
                        <p className={`mt-2 text-3xl font-bold ${card.color}`}>{card.value}</p>
                        <p className="mt-1 text-sm text-[var(--c1)]">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Access */}
            <h2 className="mt-10 mb-4 text-lg font-semibold text-white">Quick Access</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Link
                    to="/dashboard/tasks"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-[var(--c3)]/40 hover:bg-white/10 hover:shadow-xl hover:shadow-[var(--c3)]/5"
                >
                    <span className="text-3xl">📋</span>
                    <h3 className="mt-3 text-lg font-semibold text-white">Task Planner</h3>
                    <p className="mt-1 text-sm text-[var(--c1)]">
                        Manage your assignments, set deadlines & track progress.
                    </p>
                </Link>
                <Link
                    to="/dashboard/profile"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-[var(--c3)]/40 hover:bg-white/10 hover:shadow-xl hover:shadow-[var(--c3)]/5"
                >
                    <span className="text-3xl">👤</span>
                    <h3 className="mt-3 text-lg font-semibold text-white">My Profile</h3>
                    <p className="mt-1 text-sm text-[var(--c1)]">
                        Edit your name, avatar, password & account settings.
                    </p>
                </Link>
            </div>

            {/* Focus Section */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">🎯 Focus Today</h2>
                <p className="mt-2 text-sm text-[var(--c1)]">
                    Plan your tasks, stay consistent, and keep your study streak alive.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-medium text-[var(--c2)]">Study Plan</p>
                        <p className="mt-1 text-sm text-white">Review module notes and practice quizzes.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-medium text-[var(--c2)]">Music Playlist</p>
                        <p className="mt-1 text-sm text-white">Lo-fi focus session, 45 minutes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
