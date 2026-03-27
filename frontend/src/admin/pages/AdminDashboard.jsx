import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalMoodEntries: 0,
        totalSessions: 0,
        recentUsers: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all collections in parallel
                const [usersSnap, tasksSnap, moodsSnap, sessionsSnap] = await Promise.all([
                    getDocs(collection(db, 'users')),
                    getDocs(collection(db, 'tasks')),
                    getDocs(collection(db, 'moods')),
                    getDocs(collection(db, 'sessions')),
                ]);

                const completedTasks = tasksSnap.docs.filter(d => d.data().completed).length;

                // Get 5 most recent users
                const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                users.sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || 0;
                    const bTime = b.createdAt?.toMillis?.() || 0;
                    return bTime - aTime;
                });

                setStats({
                    totalUsers: usersSnap.size,
                    totalTasks: tasksSnap.size,
                    completedTasks,
                    totalMoodEntries: moodsSnap.size,
                    totalSessions: sessionsSnap.size,
                    recentUsers: users.slice(0, 5),
                });
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
            }
            setLoading(false);
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6d5fe7' },
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
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>
                    Admin Dashboard
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                    Overview of all STUZIC platform activity
                </p>
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
                                All time
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

            {/* Recent users table */}
            <div style={{
                padding: '1.5rem',
                borderRadius: '18px',
                background: 'rgba(20,14,50,0.6)',
                border: '1px solid rgba(109,95,231,0.15)',
                backdropFilter: 'blur(10px)',
            }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0ecff', margin: '0 0 1rem' }}>
                    Recent Users
                </h2>
                {stats.recentUsers.length === 0 ? (
                    <p style={{ color: '#a78bfa', fontSize: '0.875rem' }}>No users found.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Name', 'Email', 'Role', 'Joined'].map((h) => (
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
                            {stats.recentUsers.map((user) => (
                                <tr key={user.id}>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#f0ecff', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                        {user.name || 'N/A'}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#c4b5fd', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                        {user.email || 'N/A'}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600,
                                            background: user.role === 'admin' ? 'rgba(248,113,113,0.15)' : 'rgba(109,95,231,0.15)',
                                            color: user.role === 'admin' ? '#f87171' : '#a78bfa',
                                        }}>
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                        {user.createdAt?.toDate?.()
                                            ? user.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'N/A'
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
