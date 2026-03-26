import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
    PieChart, Pie, Cell,
    BarChart, Bar, Legend
} from 'recharts';

// --- Mock Data ---

// Mood trends over the last 7 days (1=Low, 5=High)
const trendData = [
    { day: 'Mon', mood: 3, energy: 4 },
    { day: 'Tue', mood: 4, energy: 3 },
    { day: 'Wed', mood: 3, energy: 3 },
    { day: 'Thu', mood: 5, energy: 5 },
    { day: 'Fri', mood: 2, energy: 2 },
    { day: 'Sat', mood: 4, energy: 4 },
    { day: 'Sun', mood: 4, energy: 3 },
];

const activityData = [
    { name: 'Studying', value: 45 },
    { name: 'Relaxing', value: 25 },
    { name: 'Working Out', value: 15 },
    { name: 'Commuting', value: 15 },
];

const energyData = [
    { name: 'Low', count: 4 },
    { name: 'Medium', count: 12 },
    { name: 'High', count: 7 },
];

// Theme Colors
const COLORS = ['#8F8BB6', '#585296', '#3C436B', '#B6B4BB'];

const MoodAnalyticsPage = () => {

    // Custom Glassmorphic Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1c1848]/90 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-[0_0_20px_rgba(88,82,150,0.5)]">
                    <p className="text-white font-bold text-sm mb-2 opacity-90">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-semibold tracking-wide" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full min-h-[calc(100vh-4rem)] p-4 md:p-8 flex flex-col font-sans overflow-y-auto custom-scrollbar">

            {/* Header Content */}
            <div className="mb-8 pl-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg flex items-center gap-3">
                    Your Vibe Check <span className="animate-pulse">✨</span>
                </h1>
                <p className="text-[#8F8BB6] text-sm md:text-base mt-2 font-medium tracking-wide">
                    Deep-dive into your study rhythms, music tastes, and energy levels.
                </p>
            </div>

            {/* Quick Stats Row (Gamification / Student Appeal) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stat 1 */}
                <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-6 shadow-lg backdrop-blur-md group hover:bg-white/10 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#585296] rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8F8BB6] to-[#585296] flex items-center justify-center text-xl shadow-inner">
                            🔥
                        </div>
                        <div>
                            <p className="text-[#B6B4BB] text-xs font-bold tracking-wider uppercase">Current Streak</p>
                            <h3 className="text-2xl font-bold text-white mt-0.5">7 Days</h3>
                        </div>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-6 shadow-lg backdrop-blur-md group hover:bg-white/10 transition-all duration-300">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#8F8BB6] rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3C436B] to-[#585296] flex items-center justify-center text-xl shadow-inner border border-white/10">
                            🎧
                        </div>
                        <div>
                            <p className="text-[#B6B4BB] text-xs font-bold tracking-wider uppercase">Top Vibe</p>
                            <h3 className="text-2xl font-bold text-white mt-0.5">Lofi Focus</h3>
                        </div>
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-6 shadow-lg backdrop-blur-md group hover:bg-white/10 transition-all duration-300">
                    <div className="absolute -left-4 -top-4 w-24 h-24 bg-[#B6B4BB] rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner border border-[#8F8BB6]/50" style={{ background: 'linear-gradient(135deg, rgba(88,82,150,0.8) 0%, rgba(39,45,62,0.8) 100%)' }}>
                            ⚡
                        </div>
                        <div>
                            <p className="text-[#B6B4BB] text-xs font-bold tracking-wider uppercase">Avg Energy</p>
                            <h3 className="text-2xl font-bold text-white mt-0.5">Medium-High</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* 1. Feature Chart (Spans 2 columns on large screens) */}
                <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-[#1c1848]/40 backdrop-blur-xl p-6 md:p-8 shadow-2xl flex flex-col hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-white font-bold text-xl drop-shadow-sm">Mood & Energy Flow</h2>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-[#8F8BB6] font-semibold tracking-wide">Last 7 Days</span>
                    </div>
                    <div className="flex-1 w-full min-h-[250px] md:min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8F8BB6" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#8F8BB6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#585296" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#585296" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" stroke="#B6B4BB" tick={{ fill: '#B6B4BB', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#B6B4BB" tick={{ fill: '#8F8BB6', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} domain={[0, 5]} dx={-10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                <Area type="monotone" dataKey="mood" name="Mood" stroke="#8F8BB6" strokeWidth={4} fillOpacity={1} fill="url(#colorMood)" animationDuration={1500} />
                                <Area type="monotone" dataKey="energy" name="Energy" stroke="#585296" strokeWidth={4} fillOpacity={1} fill="url(#colorEnergy)" animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Activity Distribution */}
                <div className="xl:col-span-1 rounded-3xl border border-white/10 bg-[#1c1848]/40 backdrop-blur-xl p-6 md:p-8 shadow-2xl flex flex-col hover:border-white/20 transition-colors">
                    <h2 className="text-white font-bold text-xl drop-shadow-sm mb-1">Your Contexts</h2>
                    <p className="text-xs text-[#8F8BB6] mb-4 font-medium">When do you listen most?</p>
                    <div className="flex-1 w-full min-h-[250px] relative flex justify-center items-center overflow-visible">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={activityData}
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="transparent"
                                    animationDuration={1500}
                                >
                                    {activityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-lg" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Icon/Text absolute positioning */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl text-white opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">📚</span>
                        </div>
                    </div>
                    {/* Tiny visual legend */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4">
                        {activityData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 border border-white/5">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-[11px] font-semibold text-[#f0ecff] truncate">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Energy Bar Chart (Spans full width down below) */}
                <div className="xl:col-span-3 rounded-3xl border border-white/10 bg-[#1c1848]/40 backdrop-blur-xl p-6 md:p-8 shadow-2xl flex flex-col mt-2 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🔋</span>
                        <h2 className="text-white font-bold text-xl drop-shadow-sm">Energy Profile</h2>
                    </div>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={energyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#B6B4BB" tick={{ fill: '#B6B4BB', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#B6B4BB" tick={{ fill: '#8F8BB6', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="count" name="Frequency" radius={[8, 8, 8, 8]} animationDuration={1500}>
                                    {energyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 1 ? '#585296' : (index === 2 ? '#8F8BB6' : '#3C436B')} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Required CSS for custom scrollbar hidden internally if needed */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(143,139,182,0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(143,139,182,0.6);
                }
            `}</style>
        </div>
    );
};

export default MoodAnalyticsPage;
