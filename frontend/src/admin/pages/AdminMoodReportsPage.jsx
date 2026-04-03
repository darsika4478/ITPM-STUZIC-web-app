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
    const [search, setSearch] = useState('');
    const [activityFilter, setActivityFilter] = useState('all');

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
                    const aTime = a.createdAt?.toMillis?.() || 0;
                    const bTime = b.createdAt?.toMillis?.() || 0;
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
            mapped[user.id] = user.name || user.email || user.id;
        });
        return mapped;
    }, [users]);

    const allActivities = useMemo(() => {
        const activitySet = new Set();
        moods.forEach((item) => {
            if (item.activity) activitySet.add(item.activity);
        });
        return Array.from(activitySet).sort();
    }, [moods]);

    const filteredMoods = useMemo(() => {
        const queryText = search.trim().toLowerCase();
        return moods.filter((item) => {
            if (activityFilter !== 'all' && (item.activity || 'unknown') !== activityFilter) return false;
            if (!queryText) return true;
            const owner = (userMap[item.userId] || item.userId || '').toLowerCase();
            const activity = (item.activity || '').toLowerCase();
            const moodLabel = MOOD_LABEL[normalizeMood(item.mood)]?.label.toLowerCase();
            return owner.includes(queryText) || activity.includes(queryText) || moodLabel.includes(queryText);
        });
    }, [moods, search, activityFilter, userMap]);

    const stats = useMemo(() => {
        const total = filteredMoods.length;
        const avgMood = total
            ? (filteredMoods.reduce((sum, item) => sum + normalizeMood(item.mood), 0) / total).toFixed(2)
            : '0.00';
        const avgEnergy = total
            ? (filteredMoods.reduce((sum, item) => sum + (Number(item.energy) || 0), 0) / total).toFixed(2)
            : '0.00';

        const moodBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        filteredMoods.forEach((item) => {
            moodBreakdown[normalizeMood(item.mood)] += 1;
        });

        return { total, avgMood, avgEnergy, moodBreakdown };
    }, [filteredMoods]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading mood reports...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>Mood Reports</h1>
                <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                    Review mood check-ins, activity contexts, and emotional trends.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {[
                    { label: 'Entries', value: stats.total, icon: '🎭', color: '#ec4899' },
                    { label: 'Avg Mood', value: stats.avgMood, icon: '📈', color: '#6d5fe7' },
                    { label: 'Avg Energy', value: stats.avgEnergy, icon: '⚡', color: '#f59e0b' },
                ].map((item) => (
                    <div key={item.label} style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(20,14,50,0.6)', border: `1px solid ${item.color}30` }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#a78bfa' }}>{item.icon} {item.label}</p>
                        <p style={{ margin: '0.3rem 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#f0ecff' }}>{item.value}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by user/activity/mood"
                    style={{
                        flex: 1,
                        minWidth: '220px',
                        borderRadius: '12px',
                        border: '1px solid rgba(248,113,113,0.25)',
                        background: 'rgba(20,14,50,0.6)',
                        color: '#f0ecff',
                        padding: '10px 12px',
                        outline: 'none',
                    }}
                />
                <select
                    value={activityFilter}
                    onChange={(event) => setActivityFilter(event.target.value)}
                    style={{ borderRadius: '12px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(20,14,50,0.6)', color: '#f0ecff', padding: '10px 12px', outline: 'none' }}
                >
                    <option value="all">All Activities</option>
                    {allActivities.map((activity) => (
                        <option key={activity} value={activity}>{activity}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(100px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{MOOD_LABEL[value].icon}</p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#a78bfa' }}>{MOOD_LABEL[value].label}</p>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#f0ecff' }}>{stats.moodBreakdown[value]}</p>
                    </div>
                ))}
            </div>

            <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                {filteredMoods.length === 0 ? (
                    <p style={{ color: '#a78bfa', margin: 0 }}>No mood entries found for this filter.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['User', 'Mood', 'Energy', 'Activity', 'Date'].map((column) => (
                                    <th key={column} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.2)', textTransform: 'uppercase' }}>
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMoods.map((item) => {
                                const moodValue = normalizeMood(item.mood);
                                return (
                                    <tr key={item.id}>
                                        <td style={{ padding: '0.75rem', color: '#f0ecff', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {userMap[item.userId] || 'Unknown user'}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#c4b5fd', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {MOOD_LABEL[moodValue].icon} {MOOD_LABEL[moodValue].label}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#fbbf24', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {item.energy ?? 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {item.activity || 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {item.date || item.createdAt?.toDate?.()?.toLocaleDateString('en-US') || 'N/A'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminMoodReportsPage;