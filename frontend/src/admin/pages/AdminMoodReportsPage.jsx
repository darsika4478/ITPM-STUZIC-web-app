import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const MOOD_LABEL = {
    1: { label: 'Sad', icon: '😢' },
    2: { label: 'Low', icon: '😕' },
    3: { label: 'Neutral', icon: '😐' },
    4: { label: 'Good', icon: '🙂' },
    5: { label: 'Happy', icon: '😄' },
};

const normalizeMood = (rawMood) => {
    const num = Number(rawMood);
    if (!Number.isNaN(num) && num >= 1 && num <= 5) return num;
    const text = String(rawMood || '').toLowerCase();
    if (text.includes('sad')) return 1;
    if (text.includes('low')) return 2;
    if (text.includes('neutral')) return 3;
    if (text.includes('good')) return 4;
    if (text.includes('happy')) return 5;
    return 3;
};

const AdminMoodReportsPage = () => {
    const [moods, setMoods] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [moodsSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'moods')),
                    getDocs(collection(db, 'users')),
                ]);
                const moodRows = moodsSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
                const userRows = usersSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
                
                moodRows.sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || new Date(a.date).getTime() || 0;
                    const bTime = b.createdAt?.toMillis?.() || new Date(b.date).getTime() || 0;
                    return bTime - aTime;
                });

                setMoods(moodRows);
                setUsers(userRows);
            } catch (error) {
                console.error('Failed to load mood reports:', error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const userMap = useMemo(() => {
        const mapped = {};
        users.forEach((user) => {
            mapped[user.id] = user.name || user.email || `User ${user.id.slice(0, 4)}`;
        });
        return mapped;
    }, [users]);

    const stats = useMemo(() => {
        const total = moods.length;
        const avgMood = total
            ? (moods.reduce((sum, item) => sum + normalizeMood(item.mood), 0) / total).toFixed(2)
            : '0.00';
        const avgEnergy = total
            ? (moods.reduce((sum, item) => sum + (Number(item.energy) || 0), 0) / total).toFixed(2)
            : '0.00';

        const moodBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        moods.forEach((item) => {
            moodBreakdown[normalizeMood(item.mood)] += 1;
        });

        return { total, avgMood, avgEnergy, moodBreakdown };
    }, [moods]);

    const moodTrends = useMemo(() => {
        const trends = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Initialize last 14 days
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            trends[dateStr] = { totalScore: 0, count: 0 };
        }

        moods.forEach(item => {
            let itemDate = null;
            if (item.createdAt?.toDate) {
                itemDate = item.createdAt.toDate();
            } else if (item.date) {
                itemDate = new Date(item.date);
            }
            
            if (itemDate) {
                itemDate.setHours(0, 0, 0, 0);
                const diffTime = Math.abs(today - itemDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays < 14) {
                    const dateStr = itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (trends[dateStr]) {
                        trends[dateStr].totalScore += normalizeMood(item.mood);
                        trends[dateStr].count += 1;
                    }
                }
            }
        });

        return Object.keys(trends).map(dateStr => {
            const data = trends[dateStr];
            const avg = data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0;
            return { date: dateStr, avg: Number(avg), count: data.count };
        });
    }, [moods]);

    const userEngagement = useMemo(() => {
        const engMap = {};
        moods.forEach(item => {
            if (!engMap[item.userId]) {
                engMap[item.userId] = { count: 0, lastEntry: null };
            }
            engMap[item.userId].count += 1;
            
            const itemTime = item.createdAt?.toMillis?.() || new Date(item.date).getTime() || 0;
            if (!engMap[item.userId].lastEntry || itemTime > engMap[item.userId].lastEntry) {
                engMap[item.userId].lastEntry = itemTime;
            }
        });

        const arr = Object.keys(engMap).map(uid => {
            return {
                id: uid,
                name: userMap[uid] || `User ${uid.slice(0, 4)}`,
                count: engMap[uid].count,
                lastEntryDate: engMap[uid].lastEntry ? new Date(engMap[uid].lastEntry).toLocaleDateString() : 'N/A'
            };
        });
        arr.sort((a, b) => b.count - a.count);
        return arr;
    }, [moods, userMap]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading mood trends...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>Platform Mood Analytics</h1>
                <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                    Anonymized aggregated emotional trends and platform engagement.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Entries', value: stats.total, icon: '🎭', color: '#ec4899' },
                    { label: 'Platform Avg Mood', value: stats.avgMood, icon: '📈', color: '#6d5fe7' },
                    { label: 'Platform Avg Energy', value: stats.avgEnergy, icon: '⚡', color: '#f59e0b' },
                ].map((item) => (
                    <div key={item.label} style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(20,14,50,0.6)', border: `1px solid ${item.color}30` }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#a78bfa' }}>{item.icon} {item.label}</p>
                        <p style={{ margin: '0.3rem 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#f0ecff' }}>{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Mood Distribution Chart Header */}
            <div style={{ marginBottom: '0.5rem', color: '#f0ecff', fontWeight: 600, fontSize: '1rem' }}>Overall Mood Distribution</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(80px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                {[1, 2, 3, 4, 5].map((value) => {
                    const count = stats.moodBreakdown[value] || 0;
                    const max = Math.max(...Object.values(stats.moodBreakdown), 1);
                    const percent = Math.round((count / max) * 100);

                    return (
                        <div key={value} style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '1.5rem' }}>{MOOD_LABEL[value].icon}</p>
                            <p style={{ margin: '0.2rem 0', fontSize: '0.75rem', color: '#a78bfa' }}>{MOOD_LABEL[value].label}</p>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(109,95,231,0.2)', borderRadius: '3px', margin: '0.5rem 0', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${percent}%`, background: '#6d5fe7', borderRadius: '3px', transition: 'width 0.5s ease-in-out' }}></div>
                            </div>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f0ecff' }}>{count}</p>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Mood Trends Line Chart Approximation */}
                <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                    <h2 style={{ color: '#f0ecff', fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>14-Day Platform Mood Trend</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '150px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        {moodTrends.map((t, i) => {
                            const heightPct = t.avg > 0 ? (t.avg / 5) * 100 : 0;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                                    <div style={{ width: '100%', maxWidth: '20px', height: `${heightPct}%`, background: t.avg >= 3.5 ? '#4ade80' : t.avg >= 2.5 ? '#fbbf24' : '#f87171', borderRadius: '4px 4px 0 0', opacity: t.count > 0 ? 1 : 0.2 }} title={`${t.date}: Avg ${t.avg} (${t.count} entries)`}></div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#a78bfa', fontSize: '0.7rem' }}>
                        <span>{moodTrends[0]?.date}</span>
                        <span>{moodTrends[moodTrends.length - 1]?.date}</span>
                    </div>
                </div>

                {/* User Engagement Leaderboard */}
                <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                    <h2 style={{ color: '#f0ecff', fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>User Engagement</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {userEngagement.length === 0 ? (
                            <p style={{ color: '#a78bfa', margin: 0, fontSize: '0.9rem' }}>No engagement data available.</p>
                        ) : (
                            userEngagement.map(u => (
                                <div key={u.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem 0', color: '#c4b5fd', fontSize: '0.95rem', fontWeight: 600 }}>{u.name}</p>
                                        <p style={{ margin: 0, color: '#a78bfa', fontSize: '0.75rem' }}>Last entry: {u.lastEntryDate}</p>
                                    </div>
                                    <div style={{ background: 'rgba(109,95,231,0.2)', padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#f0ecff', fontWeight: 600 }}>
                                        {u.count} entries
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminMoodReportsPage;
