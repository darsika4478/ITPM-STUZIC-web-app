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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sessionsSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'sessions')),
                    getDocs(collection(db, 'users')),
                ]);

                const sessionRows = sessionsSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
                const userRows = usersSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
                
                setSessions(sessionRows);
                setUsers(userRows);
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
            mapped[user.id] = user.name || user.email || `User ${user.id.slice(0, 4)}`;
        });
        return mapped;
    }, [users]);

    const stats = useMemo(() => {
        const total = sessions.length;
        const durations = sessions.map(resolveDuration).filter((item) => typeof item === 'number');
        const completed = sessions.filter((session) => session.endTime || typeof session.durationMinutes === 'number').length;
        const totalMinutes = durations.reduce((sum, value) => sum + value, 0);
        const avgMinutes = durations.length ? (totalMinutes / durations.length).toFixed(1) : '0.0';
        return { total, completed, totalMinutes, avgMinutes };
    }, [sessions]);

    const userStats = useMemo(() => {
        const userActivity = {};
        sessions.forEach(session => {
            if (!userActivity[session.userId]) {
                userActivity[session.userId] = { sessions: 0, totalMinutes: 0 };
            }
            userActivity[session.userId].sessions += 1;
            const duration = resolveDuration(session);
            if (typeof duration === 'number') {
                userActivity[session.userId].totalMinutes += duration;
            }
        });

        const arr = Object.keys(userActivity).map(uid => {
            return {
                id: uid,
                name: userMap[uid] || `User ${uid.slice(0, 4)}`,
                ...userActivity[uid]
            };
        });
        arr.sort((a, b) => b.totalMinutes - a.totalMinutes);
        return arr;
    }, [sessions, userMap]);

    const peakHours = useMemo(() => {
        const hours = Array.from({ length: 24 }, () => 0);
        sessions.forEach(session => {
            const time = toDateSafe(session.startTime || session.createdAt);
            if (time) {
                hours[time.getHours()] += 1;
            }
        });

        const max = Math.max(...hours, 1);
        return hours.map((count, hour) => ({
            hour,
            count,
            percent: Math.round((count / max) * 100),
            label: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`
        }));
    }, [sessions]);

    const exportToCSV = () => {
        const headers = ['User', 'Total Sessions', 'Total Duration (min)'];
        const csvContent = [
            headers.join(','),
            ...userStats.map(u => [
                `"${u.name}"`,
                u.sessions,
                u.totalMinutes
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'aggregated_sessions.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading session analytics...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>Platform Sessions Overview</h1>
                    <p style={{ fontSize: '0.875rem', color: '#a78bfa', margin: '0.25rem 0 0' }}>Aggregated study session metrics and peak hours.</p>
                </div>
                <button
                    onClick={exportToCSV}
                    style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)',
                        background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    ⬇ Export CSV
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Sessions', value: stats.total, icon: '⏱️', color: '#3b82f6' },
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                {/* Peak Study Hours */}
                <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                    <h2 style={{ color: '#f0ecff', fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>Peak Study Hours</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '180px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {peakHours.map((h) => (
                            <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                                <div 
                                    style={{ 
                                        width: '80%', height: `${h.percent}%`, 
                                        background: h.percent >= 80 ? '#3b82f6' : h.percent >= 40 ? '#60a5fa' : '#93c5fd', 
                                        borderRadius: '3px 3px 0 0', opacity: h.count > 0 ? 1 : 0.1 
                                    }} 
                                    title={`${h.label}: ${h.count} sessions`}
                                ></div>
                                {h.hour % 4 === 0 && (
                                    <span style={{ position: 'absolute', bottom: '-20px', fontSize: '0.65rem', color: '#a78bfa' }}>
                                        {h.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ height: '20px' }}></div> {/* Spacer for labels */}
                </div>

                {/* Sessions per User Leaderboard */}
                <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                    <h2 style={{ color: '#f0ecff', fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>Sessions Engagement per User</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {userStats.length === 0 ? (
                            <p style={{ color: '#a78bfa', margin: 0, fontSize: '0.9rem' }}>No session data available.</p>
                        ) : (
                            userStats.map(u => (
                                <div key={u.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem 0', color: '#c4b5fd', fontSize: '0.95rem', fontWeight: 600 }}>{u.name}</p>
                                        <p style={{ margin: 0, color: '#a78bfa', fontSize: '0.75rem' }}>Total time: {u.totalMinutes} mins</p>
                                    </div>
                                    <div style={{ background: 'rgba(59,130,246,0.15)', padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {u.sessions} sessions
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

export default AdminSessionsPage;
