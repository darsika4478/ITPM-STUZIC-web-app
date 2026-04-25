import React, { useEffect, useMemo, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
    PieChart, Pie, Cell,
    BarChart, Bar, Legend
} from 'recharts';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../config/firebase';

// Theme Colors
const COLORS = ['#8F8BB6', '#585296', '#3C436B', '#B6B4BB'];

const ACTIVITY_LABELS = {
    studying: 'Studying',
    workingout: 'Working Out',
    commuting: 'Commuting',
    relaxing: 'Relaxing',
};

const GENRE_LABELS = {
    pop: 'Pop',
    rock: 'Rock & Alt',
    classical: 'Classical',
    lofi: 'Lofi Focus',
    electronic: 'Electronic',
    rb: 'R&B / Soul',
};

const toLocalDateId = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const buildDocId = (uid, dateId) => `${uid}_${dateId}`;
const MOOD_COLLECTIONS = ['moods', 'moodEntries'];

const getRecentDateIds = (days) => {
    const ids = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i += 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        ids.push(toLocalDateId(d));
    }

    return ids;
};

const fetchEntriesByKnownIds = async (uid, days = 180) => {
    const dateIds = getRecentDateIds(days);
    const reads = await Promise.all(
        dateIds.map(async (dateId) => {
            const entryRef = doc(db, 'moodEntries', buildDocId(uid, dateId));
            const snap = await getDoc(entryRef);
            if (!snap.exists()) return null;
            return { id: snap.id, ...snap.data() };
        })
    );

    return reads.filter(Boolean);
};

const fetchEntriesForUserFromCollection = async (collectionName, uid) => {
    const moodsRef = collection(db, collectionName);
    const moodQuery = query(moodsRef, where('userId', '==', uid));
    const snapshot = await getDocs(moodQuery);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

const parseEntryDate = (entry) => {
    if (typeof entry?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
        return new Date(`${entry.date}T00:00:00`);
    }

    if (entry?.recordedAt?.toDate) {
        return entry.recordedAt.toDate();
    }

    return null;
};

const getEnergyBucket = (energy) => {
    if (energy <= 2) return 'Low';
    if (energy === 3) return 'Medium';
    return 'High';
};

const getEnergyLabel = (avgEnergy) => {
    if (avgEnergy === 0) return 'No Data';
    if (avgEnergy <= 2) return 'Low';
    if (avgEnergy < 4) return 'Medium';
    return 'High';
};

const csvEscape = (value) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
};

const downloadCsv = (filename, csvContent) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const MoodAnalyticsPage = () => {
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setEntries([]);
            setIsLoading(false);
            return;
        }

        const fetchMoodEntries = async () => {
            setIsLoading(true);
            setLoadError('');

            try {
                const mergedById = new Map();
                let lastReadError = null;

                for (const collectionName of MOOD_COLLECTIONS) {
                    try {
                        const rows = await fetchEntriesForUserFromCollection(collectionName, currentUser.uid);
                        rows.forEach((row) => {
                            if (!mergedById.has(row.id)) {
                                mergedById.set(row.id, row);
                            }
                        });
                    } catch (collectionError) {
                        lastReadError = collectionError;

                        const code = collectionError?.code || '';
                        const isQueryBlocked =
                            code === 'permission-denied' ||
                            code === 'failed-precondition' ||
                            code === 'unavailable';

                        if (collectionName === 'moodEntries' && isQueryBlocked) {
                            // Legacy fallback for stricter rules that block list/query.
                            const fallbackRows = await fetchEntriesByKnownIds(currentUser.uid, 180);
                            fallbackRows.forEach((row) => {
                                if (!mergedById.has(row.id)) {
                                    mergedById.set(row.id, row);
                                }
                            });
                        }
                    }
                }

                if (mergedById.size === 0 && lastReadError) {
                    throw lastReadError;
                }

                setEntries(Array.from(mergedById.values()));
            } catch (error) {
                const code = error?.code || '';
                console.error('Failed to load mood analytics:', error);
                if (code === 'permission-denied') {
                    setLoadError('Could not load your analytics from Firebase. Firestore rules blocked this read.');
                } else {
                    setLoadError('Could not load your analytics from Firebase. Please try again.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchMoodEntries();
    }, [currentUser]);

    const analytics = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daySeeds = [];
        for (let i = 6; i >= 0; i -= 1) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            daySeeds.push({
                id: toLocalDateId(d),
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                moodSum: 0,
                moodCount: 0,
                energySum: 0,
                energyCount: 0,
            });
        }

        const dayMap = daySeeds.reduce((acc, seed) => {
            acc[seed.id] = seed;
            return acc;
        }, {});

        const activityCounts = {
            Studying: 0,
            Relaxing: 0,
            'Working Out': 0,
            Commuting: 0,
        };

        const energyCounts = { Low: 0, Medium: 0, High: 0 };
        const genreCounts = {};
        const uniqueDateSet = new Set();

        let energyTotal = 0;
        let energyTotalCount = 0;

        entries.forEach((entry) => {
            const moodValue = Number(entry?.moodValue);
            const energy = Number(entry?.preferences?.energy);
            const activityRaw = String(entry?.preferences?.activity || '').toLowerCase();
            const genreRaw = String(entry?.preferences?.genre || '').toLowerCase();

            const parsedDate = parseEntryDate(entry);
            if (parsedDate) {
                parsedDate.setHours(0, 0, 0, 0);
                const dateId = toLocalDateId(parsedDate);
                uniqueDateSet.add(dateId);
                if (dayMap[dateId]) {
                    if (moodValue >= 1 && moodValue <= 5) {
                        dayMap[dateId].moodSum += moodValue;
                        dayMap[dateId].moodCount += 1;
                    }

                    if (energy >= 1 && energy <= 5) {
                        dayMap[dateId].energySum += energy;
                        dayMap[dateId].energyCount += 1;
                    }
                }
            }

            if (activityRaw) {
                const activityLabel = ACTIVITY_LABELS[activityRaw] || 'Studying';
                activityCounts[activityLabel] = (activityCounts[activityLabel] || 0) + 1;
            }

            if (energy >= 1 && energy <= 5) {
                energyCounts[getEnergyBucket(energy)] += 1;
                energyTotal += energy;
                energyTotalCount += 1;
            }

            if (genreRaw) {
                genreCounts[genreRaw] = (genreCounts[genreRaw] || 0) + 1;
            }
        });

        const trendData = daySeeds.map((seed) => {
            const moodAvg = seed.moodCount ? Number((seed.moodSum / seed.moodCount).toFixed(1)) : 0;
            const energyAvg = seed.energyCount ? Number((seed.energySum / seed.energyCount).toFixed(1)) : 0;
            return {
                day: seed.day,
                mood: moodAvg,
                energy: energyAvg,
            };
        });

        const activityData = Object.entries(activityCounts)
            .map(([name, value]) => ({ name, value }))
            .filter((item) => item.value > 0);

        const energyData = [
            { name: 'Low', count: energyCounts.Low },
            { name: 'Medium', count: energyCounts.Medium },
            { name: 'High', count: energyCounts.High },
        ];

        const topGenreEntry = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
        const topVibe = topGenreEntry ? (GENRE_LABELS[topGenreEntry[0]] || topGenreEntry[0]) : 'No Data';

        let streak = 0;
        const cursor = new Date(today);
        while (uniqueDateSet.has(toLocalDateId(cursor))) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        const avgEnergy = energyTotalCount ? Number((energyTotal / energyTotalCount).toFixed(1)) : 0;

        return {
            trendData,
            activityData,
            energyData,
            topVibe,
            currentStreak: streak,
            avgEnergy,
            avgEnergyLabel: getEnergyLabel(avgEnergy),
            hasData: entries.length > 0,
        };
    }, [entries]);

    const handleExportReport = () => {
        if (!analytics.hasData || isExporting) return;

        try {
            setIsExporting(true);

            const generatedAt = new Date();
            const summaryRows = [
                ['Metric', 'Value'],
                ['Current Streak', `${analytics.currentStreak} ${analytics.currentStreak === 1 ? 'Day' : 'Days'}`],
                ['Top Vibe', analytics.topVibe],
                ['Average Energy', analytics.avgEnergyLabel],
                ['Total Entries', entries.length],
            ];

            const trendRows = [
                ['Day', 'Average Mood', 'Average Energy'],
                ...analytics.trendData.map((item) => [item.day, item.mood, item.energy]),
            ];

            const activityRows = [
                ['Context', 'Count'],
                ...analytics.activityData.map((item) => [item.name, item.value]),
            ];

            const energyRows = [
                ['Energy Bucket', 'Count'],
                ...analytics.energyData.map((item) => [item.name, item.count]),
            ];

            const entriesRows = [
                ['Date', 'Mood', 'Energy', 'Activity', 'Genre'],
                ...[...entries]
                    .sort((a, b) => {
                        const dateA = parseEntryDate(a)?.getTime() || 0;
                        const dateB = parseEntryDate(b)?.getTime() || 0;
                        return dateB - dateA;
                    })
                    .map((entry) => {
                        const parsedDate = parseEntryDate(entry);
                        const dateText = parsedDate ? toLocalDateId(parsedDate) : (entry?.date || 'N/A');
                        const moodText = entry?.moodLabel || entry?.moodValue || 'N/A';
                        const energyRaw = entry?.preferences?.energy ?? entry?.energy;
                        const activityRaw = String(entry?.preferences?.activity || entry?.activity || '').toLowerCase();
                        const genreRaw = String(entry?.preferences?.genre || '').toLowerCase();

                        const energyNumber = Number(energyRaw);
                        const energyText = Number.isFinite(energyNumber)
                            ? energyNumber
                            : (String(energyRaw || 'N/A'));

                        return [
                            dateText,
                            moodText,
                            energyText,
                            ACTIVITY_LABELS[activityRaw] || activityRaw || 'N/A',
                            GENRE_LABELS[genreRaw] || genreRaw || 'N/A',
                        ];
                    }),
            ];

            const sections = [
                [['STUZIC Mood Analytics Report']],
                [['Generated At', generatedAt.toLocaleString('en-US')]],
                [['User ID', currentUser?.uid || 'N/A']],
                [],
                [['Summary']],
                ...summaryRows.map((row) => row),
                [],
                [['Mood & Energy Flow (Last 7 Days)']],
                ...trendRows.map((row) => row),
                [],
                [['Activity Distribution']],
                ...activityRows.map((row) => row),
                [],
                [['Energy Profile']],
                ...energyRows.map((row) => row),
                [],
                [['Entries']],
                ...entriesRows.map((row) => row),
            ];

            const csvContent = sections
                .map((row) => row.map((cell) => csvEscape(cell)).join(','))
                .join('\n');

            const dateStamp = toLocalDateId(generatedAt);
            downloadCsv(`mood-analytics-report-${dateStamp}.csv`, csvContent);
        } catch (error) {
            console.error('Failed to export mood analytics report:', error);
            window.alert('Could not export your analytics report right now. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

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

    if (isLoading) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-4rem)] p-6 md:p-8 flex items-center justify-center">
                <div className="rounded-2xl border border-white/10 bg-[#1c1848]/40 backdrop-blur-xl px-6 py-4 text-sm text-white/80">
                    Loading your mood analytics...
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-4rem)] p-6 md:p-8 flex items-center justify-center">
                <div className="rounded-2xl border border-red-300/30 bg-red-500/10 px-6 py-4 text-sm text-red-100">
                    {loadError}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[calc(100vh-4rem)] p-4 md:p-8 flex flex-col font-sans overflow-y-auto custom-scrollbar">

            {/* Header Content */}
            <div className="mb-8 pl-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg flex items-center gap-3">
                        Your Vibe Check <span className="animate-pulse">✨</span>
                    </h1>
                    <p className="text-[#8F8BB6] text-sm md:text-base mt-2 font-medium tracking-wide">
                        Deep-dive into your study rhythms, music tastes, and energy levels from Firebase data.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExportReport}
                    disabled={!analytics.hasData || isExporting}
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isExporting ? 'Preparing Report...' : 'Export Report (.csv)'}
                </button>
            </div>

            {!analytics.hasData && (
                <div className="mb-8 rounded-2xl border border-white/10 bg-[#1c1848]/30 p-5 text-sm text-white/80">
                    No mood records found yet. Submit your mood from the Mood page to unlock analytics.
                </div>
            )}

            {/* Quick Stats Row (Gamification / Student Appeal) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stat 1 */}
                <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-6 shadow-lg backdrop-blur-md group hover:bg-white/10 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#585296] rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#8F8BB6] to-[#585296] flex items-center justify-center text-xl shadow-inner">
                            🔥
                        </div>
                        <div>
                            <p className="text-[#B6B4BB] text-xs font-bold tracking-wider uppercase">Current Streak</p>
                            <h3 className="text-2xl font-bold text-white mt-0.5">{analytics.currentStreak} {analytics.currentStreak === 1 ? 'Day' : 'Days'}</h3>
                        </div>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-6 shadow-lg backdrop-blur-md group hover:bg-white/10 transition-all duration-300">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#8F8BB6] rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#3C436B] to-[#585296] flex items-center justify-center text-xl shadow-inner border border-white/10">
                            🎧
                        </div>
                        <div>
                            <p className="text-[#B6B4BB] text-xs font-bold tracking-wider uppercase">Top Vibe</p>
                            <h3 className="text-2xl font-bold text-white mt-0.5">{analytics.topVibe}</h3>
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
                            <h3 className="text-2xl font-bold text-white mt-0.5">{analytics.avgEnergyLabel}</h3>
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
                    <div className="flex-1 w-full min-h-62.5 md:min-h-75">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <div className="flex-1 w-full min-h-62.5 relative flex justify-center items-center overflow-visible">
                        {analytics.activityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.activityData}
                                        innerRadius={75}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="transparent"
                                        animationDuration={1500}
                                    >
                                        {analytics.activityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-lg" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-sm text-white/60">No activity data yet.</div>
                        )}
                        {/* Center Icon/Text absolute positioning */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl text-white opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">📚</span>
                        </div>
                    </div>
                    {/* Tiny visual legend */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4">
                        {analytics.activityData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 border border-white/5">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
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
                    <div className="w-full h-62.5">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.energyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#B6B4BB" tick={{ fill: '#B6B4BB', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#B6B4BB" tick={{ fill: '#8F8BB6', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="count" name="Frequency" radius={[8, 8, 8, 8]} animationDuration={1500}>
                                    {analytics.energyData.map((entry, index) => (
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
