import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const toDateSafe = (value) => {
    if (!value) return null;
    if (typeof value?.toDate === 'function') return value.toDate();
    if (typeof value === 'string') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (typeof value === 'number') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (value?.seconds) {
        const parsed = new Date(value.seconds * 1000);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
};

const formatDateTime = (value) => {
    const date = toDateSafe(value);
    return date
        ? date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';
};

const resolveDuration = (session) => {
    if (typeof session.durationMinutes === 'number') return session.durationMinutes;
    const start = toDateSafe(session.startTime);
    const end = toDateSafe(session.endTime);
    if (!start || !end) return null;
    return Math.max(0, Math.round((end - start) / 60000));
};

const AdminSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [users, setUsers] = useState([]);
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [moodFilter, setMoodFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sessionsSnap, usersSnap, moodsSnap] = await Promise.all([
                    getDocs(collection(db, 'sessions')),
                    getDocs(collection(db, 'users')),
                    getDocs(collection(db, 'moods')),
                ]);

                const sessionRows = sessionsSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
                const userRows = usersSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
                const moodRows = moodsSnap.docs.map((item) => ({ id: item.id, ...item.data() }));

                sessionRows.sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || 0;
                    const bTime = b.createdAt?.toMillis?.() || 0;
                    return bTime - aTime;
                });

                setSessions(sessionRows);
                setUsers(userRows);
                setMoods(moodRows);
            } catch (error) {
                console.error('Failed to load session reports:', error);
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

    const moodOptions = useMemo(() => {
        const set = new Set();
        sessions.forEach((session) => {
            if (session.mood) set.add(String(session.mood));
        });
        return Array.from(set).sort();
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        const queryText = search.trim().toLowerCase();
        return sessions.filter((session) => {
            if (moodFilter !== 'all' && String(session.mood || '').toLowerCase() !== moodFilter.toLowerCase()) return false;
            if (!queryText) return true;
            const owner = (userMap[session.userId] || session.userId || '').toLowerCase();
            const track = String(session.trackTitle || '').toLowerCase();
            const mood = String(session.mood || '').toLowerCase();
            return owner.includes(queryText) || track.includes(queryText) || mood.includes(queryText);
        });
    }, [sessions, search, moodFilter, userMap]);

    const stats = useMemo(() => {
        const total = filteredSessions.length;
        const durations = filteredSessions.map(resolveDuration).filter((item) => typeof item === 'number');
        const completed = filteredSessions.filter((session) => session.endTime || typeof session.durationMinutes === 'number').length;
        const totalMinutes = durations.reduce((sum, value) => sum + value, 0);
        const avgMinutes = durations.length ? (totalMinutes / durations.length).toFixed(1) : '0.0';
        return { total, completed, totalMinutes, avgMinutes };
    }, [filteredSessions]);

    const fallbackByUser = useMemo(() => {
        if (sessions.length > 0) return [];
        const byUser = {};
        moods.forEach((entry) => {
            byUser[entry.userId] = (byUser[entry.userId] || 0) + 1;
        });
        return Object.entries(byUser)
            .map(([userId, entryCount]) => ({ userId, entryCount }))
            .sort((a, b) => b.entryCount - a.entryCount)
            .slice(0, 10);
    }, [sessions, moods]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading session reports...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>Session Reports</h1>
                <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                    Track study session logs and time spent metrics.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {[
                    { label: 'Sessions', value: stats.total, icon: '⏱️', color: '#3b82f6' },
                    { label: 'Completed', value: stats.completed, icon: '✅', color: '#22c55e' },
                    { label: 'Total Minutes', value: stats.totalMinutes, icon: '🧮', color: '#6d5fe7' },
                    { label: 'Avg Duration', value: stats.avgMinutes, icon: '📊', color: '#f59e0b' },
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
                    placeholder="Search user/track/mood"
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
                    value={moodFilter}
                    onChange={(event) => setMoodFilter(event.target.value)}
                    style={{ borderRadius: '12px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(20,14,50,0.6)', color: '#f0ecff', padding: '10px 12px', outline: 'none' }}
                >
                    <option value="all">All Moods</option>
                    {moodOptions.map((mood) => (
                        <option key={mood} value={mood}>{mood}</option>
                    ))}
                </select>
            </div>

            <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                {sessions.length === 0 ? (
                    <div>
                        <p style={{ color: '#a78bfa', marginTop: 0 }}>No session documents found in `sessions` collection.</p>
                        <p style={{ color: '#c4b5fd', fontSize: '0.82rem' }}>
                            Fallback summary from mood activity (top users by mood entries):
                        </p>
                        {fallbackByUser.length === 0 ? (
                            <p style={{ color: '#a78bfa', marginBottom: 0 }}>No fallback data available.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['User', 'Mood Entries'].map((column) => (
                                            <th key={column} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.2)', textTransform: 'uppercase' }}>
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fallbackByUser.map((item) => (
                                        <tr key={item.userId}>
                                            <td style={{ padding: '0.75rem', color: '#f0ecff', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>{userMap[item.userId] || item.userId}</td>
                                            <td style={{ padding: '0.75rem', color: '#c4b5fd', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>{item.entryCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <p style={{ color: '#a78bfa', margin: 0 }}>No sessions found for this filter.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['User', 'Mood', 'Track', 'Duration', 'Start', 'End'].map((column) => (
                                    <th key={column} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.2)', textTransform: 'uppercase' }}>
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.map((session) => {
                                const duration = resolveDuration(session);
                                return (
                                    <tr key={session.id}>
                                        <td style={{ padding: '0.75rem', color: '#f0ecff', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {userMap[session.userId] || 'Unknown user'}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#c4b5fd', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {session.mood || 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {session.trackTitle || 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#fbbf24', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {typeof duration === 'number' ? `${duration} min` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {formatDateTime(session.startTime || session.createdAt)}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {formatDateTime(session.endTime)}
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

export default AdminSessionsPage;