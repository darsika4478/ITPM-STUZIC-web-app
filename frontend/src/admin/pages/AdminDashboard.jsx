import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getLoginColor = (timestamp) => {
    if (!timestamp) return '#a78bfa';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = Date.now() - date;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return '#10b981';
    if (diffDays < 7) return '#f59e0b';
    return '#a78bfa';
};

const AdminDashboard = () => {
    const [rawData, setRawData] = useState({
        users: [],
        tasks: [],
        moods: [],
        sessions: []
    });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('This Week');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersSnap, tasksSnap, moodsSnap, sessionsSnap] = await Promise.all([
                    getDocs(collection(db, 'users')),
                    getDocs(collection(db, 'tasks')),
                    getDocs(collection(db, 'moods')),
                    getDocs(collection(db, 'sessions')),
                ]);

                const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                users.sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || 0;
                    const bTime = b.createdAt?.toMillis?.() || 0;
                    return bTime - aTime;
                });

                const tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                const moods = moodsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                const sessions = sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                setRawData({ users, tasks, moods, sessions });
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
            }
            setLoading(false);
        };

        fetchStats();
    }, []);

    const filterByDate = (items, startDate) => {
        if (!startDate) return items;
        return items.filter(item => {
            const time = item.createdAt?.toMillis?.();
            if (!time) return false;
            return time >= startDate.getTime();
        });
    };

    const periodDate = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        switch (period) {
            case 'Today': return now;
            case 'This Week': {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                return startOfWeek;
            }
            case 'This Month': {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return startOfMonth;
            }
            case 'All Time': return null;
            default: return null;
        }
    }, [period]);

    const stats = useMemo(() => {
        const filteredTasks = filterByDate(rawData.tasks, periodDate);
        const filteredMoods = filterByDate(rawData.moods, periodDate);
        const filteredSessions = filterByDate(rawData.sessions, periodDate);

        return {
            totalUsers: rawData.users.length,
            totalTasks: filteredTasks.length,
            completedTasks: filteredTasks.filter(t => t.completed).length,
            totalMoodEntries: filteredMoods.length,
            totalSessions: filteredSessions.length,
            recentUsers: rawData.users.slice(0, 5)
        };
    }, [rawData, periodDate]);

    const enrichedRecentUsers = useMemo(() => {
        const enriched = rawData.users.map(user => {
            let lastActive = user.lastLogin || null;
            
            if (!lastActive) {
                const userActivity = [...rawData.moods, ...rawData.sessions]
                    .filter(item => item.userId === user.id)
                    .map(item => item.createdAt?.toMillis?.() || 0)
                    .filter(t => t > 0);
                
                if (userActivity.length > 0) {
                    const maxTime = Math.max(...userActivity);
                    // Create a pseudo-timestamp object for formatLastLogin
                    lastActive = { toDate: () => new Date(maxTime) };
                }
            }
            
            const lastActiveMs = lastActive?.toMillis?.() || lastActive?.toDate?.()?.getTime() || 0;
            return { ...user, lastActive, lastActiveMs };
        });
        
        enriched.sort((a, b) => b.lastActiveMs - a.lastActiveMs);
        return enriched.slice(0, 5);
    }, [rawData]);

    const userActivity = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfThisWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
        const startOfInactive = startOfToday - 14 * 24 * 60 * 60 * 1000;

        const activityMap = {};
        rawData.users.forEach(u => activityMap[u.id] = 0);

        [...rawData.moods, ...rawData.sessions].forEach(item => {
            const userId = item.userId;
            const time = item.createdAt?.toMillis?.();
            if (userId && time && time > (activityMap[userId] || 0)) {
                activityMap[userId] = time;
            }
        });

        let activeToday = 0;
        let activeThisWeek = 0;
        let inactiveUsers = 0;

        Object.values(activityMap).forEach(lastActive => {
            if (lastActive >= startOfToday) {
                activeToday++;
                activeThisWeek++;
            } else if (lastActive >= startOfThisWeek) {
                activeThisWeek++;
            } else if (lastActive < startOfInactive) {
                inactiveUsers++;
            }
        });

        return { activeToday, activeThisWeek, inactiveUsers };
    }, [rawData]);

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6d5fe7', alwaysAllTime: true },
        { label: 'Total Tasks', value: stats.totalTasks, icon: '📋', color: '#f59e0b' },
        { label: 'Tasks Completed', value: stats.completedTasks, icon: '✅', color: '#10b981' },
        { label: 'Mood Entries', value: stats.totalMoodEntries, icon: '🎭', color: '#ec4899' },
        { label: 'Study Sessions', value: stats.totalSessions, icon: '⏱️', color: '#3b82f6' },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Page header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                        Overview of all STUZIC platform activity
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(20,14,50,0.6)', padding: '0.25rem', borderRadius: '12px', border: '1px solid rgba(109,95,231,0.25)' }}>
                    {['Today', 'This Week', 'This Month', 'All Time'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: period === p ? 'rgba(109,95,231,0.25)' : 'transparent',
                                color: period === p ? '#f0ecff' : '#a78bfa',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: period === p ? 600 : 400,
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat cards grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
            }}>
                {statCards.map((card) => (
                    <div key={card.label} style={{
                        padding: '1.25rem',
                        borderRadius: '18px',
                        background: 'rgba(20,14,50,0.6)',
                        border: `1px solid ${card.color}22`,
                        backdropFilter: 'blur(10px)',
                        boxShadow: `0 4px 20px ${card.color}15`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                            <div style={{
                                padding: '4px 10px', borderRadius: '8px',
                                background: `${card.color}18`,
                                fontSize: '0.65rem', fontWeight: 600, color: card.color,
                            }}>
                                {card.alwaysAllTime ? 'All time' : period}
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#f0ecff' }}>
                            {card.value.toLocaleString()}
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#a78bfa' }}>
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0ecff', margin: '0 0 1rem' }}>User Activity Overview</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
            }}>
                <div style={{ padding: '1.25rem', borderRadius: '18px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <p style={{ margin: '0 0 0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>Active Today</p>
                    <p style={{ margin: 0, color: '#f0ecff', fontSize: '1.75rem', fontWeight: 700 }}>{userActivity.activeToday}</p>
                </div>
                <div style={{ padding: '1.25rem', borderRadius: '18px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <p style={{ margin: '0 0 0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>Active This Week (past 7d)</p>
                    <p style={{ margin: 0, color: '#f0ecff', fontSize: '1.75rem', fontWeight: 700 }}>{userActivity.activeThisWeek}</p>
                </div>
                <div style={{ padding: '1.25rem', borderRadius: '18px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <p style={{ margin: '0 0 0.5rem', color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>Inactive Users (&gt;14d)</p>
                    <p style={{ margin: 0, color: '#f0ecff', fontSize: '1.75rem', fontWeight: 700 }}>{userActivity.inactiveUsers}</p>
                </div>
            </div>

            {/* Recently active users table */}
            <div style={{
                padding: '1.5rem',
                borderRadius: '18px',
                background: 'rgba(20,14,50,0.6)',
                border: '1px solid rgba(109,95,231,0.15)',
                backdropFilter: 'blur(10px)',
            }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0ecff', margin: '0 0 1rem' }}>
                    Recently Active Users
                </h2>
                {enrichedRecentUsers.length === 0 ? (
                    <p style={{ color: '#a78bfa', fontSize: '0.875rem' }}>No users found.</p>
                ) : (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr>
                                {['Name', 'Email', 'Joined', 'Last Login'].map((h) => (
                                    <th key={h} style={{
                                        textAlign: 'left', padding: '0.75rem 1rem',
                                        fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        borderBottom: '1px solid rgba(109,95,231,0.15)',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {enrichedRecentUsers.map((user) => {
                                return (
                                    <tr key={user.id}>
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#f0ecff', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {user.name || 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#c4b5fd', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {user.email || 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {user.createdAt?.toDate?.()
                                                ? user.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : 'N/A'
                                            }
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: getLoginColor(user.lastActive), borderBottom: '1px solid rgba(109,95,231,0.08)', fontWeight: 500 }}>
                                            {formatLastLogin(user.lastActive)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;