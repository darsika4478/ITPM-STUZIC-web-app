import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const AdminTasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'tasks')),
                    getDocs(collection(db, 'users')),
                ]);

                setTasks(tasksSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
                setUsers(usersSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
            } catch (error) {
                console.error('Failed to load task reports:', error);
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

    const isOverdue = (dueDate, completed) => {
        if (!dueDate || completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(`${dueDate}T00:00:00`);
        return due < today;
    };

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((task) => task.completed).length;
        const active = total - completed;
        const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.completed)).length;
        const highPriority = tasks.filter((task) => task.priority === 'High' && !task.completed).length;
        return { total, completed, active, overdue, highPriority };
    }, [tasks]);

    const priorityDist = useMemo(() => {
        const dist = { High: 0, Medium: 0, Low: 0 };
        tasks.forEach(task => {
            const p = task.priority || 'Medium';
            if (dist[p] !== undefined) dist[p]++;
        });
        return dist;
    }, [tasks]);

    const userStats = useMemo(() => {
        const statsMap = {};
        tasks.forEach(task => {
            if (!statsMap[task.userId]) {
                statsMap[task.userId] = { total: 0, completed: 0 };
            }
            statsMap[task.userId].total++;
            if (task.completed) statsMap[task.userId].completed++;
        });

        const arr = Object.keys(statsMap).map(uid => {
            const data = statsMap[uid];
            const name = userMap[uid] || 'Unknown User';
            const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
            return { uid, name, ...data, rate };
        });
        arr.sort((a, b) => b.total - a.total);
        return arr;
    }, [tasks, userMap]);

    const exportToCSV = () => {
        const headers = ['User', 'Total Tasks', 'Completed', 'Completion Rate (%)'];
        const csvContent = [
            headers.join(','),
            ...userStats.map(u => [
                `"${u.name}"`,
                u.total,
                u.completed,
                u.rate
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'aggregated_tasks.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading task statistics...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>Platform Tasks Overview</h1>
                    <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                        Aggregated task completion and priority distribution.
                    </p>
                </div>
                <button
                    onClick={exportToCSV}
                    style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)',
                        background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    ⬇ Export CSV
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Tasks', value: stats.total, icon: '📋', color: '#6d5fe7' },
                    { label: 'Completed', value: stats.completed, icon: '✅', color: '#22c55e' },
                    { label: 'Active', value: stats.active, icon: '⏳', color: '#f59e0b' },
                    { label: 'Overdue', value: stats.overdue, icon: '🚨', color: '#ef4444' },
                    { label: 'High Priority (Active)', value: stats.highPriority, icon: '🔴', color: '#f87171' },
                ].map((item) => (
                    <div key={item.label} style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(20,14,50,0.6)', border: `1px solid ${item.color}30` }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#a78bfa' }}>{item.icon} {item.label}</p>
                        <p style={{ margin: '0.3rem 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#f0ecff' }}>{item.value}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                {/* Priority Distribution */}
                <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                    <h2 style={{ color: '#f0ecff', fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>Priority Distribution</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { label: 'High', value: priorityDist.High, color: '#f87171' },
                            { label: 'Medium', value: priorityDist.Medium, color: '#fbbf24' },
                            { label: 'Low', value: priorityDist.Low, color: '#4ade80' }
                        ].map(p => (
                            <div key={p.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: p.color, fontSize: '0.9rem', fontWeight: 600 }}>{p.label} Priority</span>
                                    <span style={{ color: '#f0ecff', fontSize: '0.9rem', fontWeight: 600 }}>{p.value}</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${stats.total ? (p.value / stats.total) * 100 : 0}%`, height: '100%', background: p.color, borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task Completion Rate by User */}
                <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                    <h2 style={{ color: '#f0ecff', fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>Task Completion by User</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {userStats.length === 0 ? (
                            <p style={{ color: '#a78bfa', margin: 0, fontSize: '0.9rem' }}>No task data available.</p>
                        ) : (
                            userStats.map(u => (
                                <div key={u.uid} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#c4b5fd', fontSize: '0.9rem', fontWeight: 600 }}>{u.name}</span>
                                        <span style={{ color: '#f0ecff', fontSize: '0.9rem' }}>{u.completed} / {u.total} ({u.rate}%)</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${u.rate}%`, height: '100%', 
                                            background: u.rate >= 80 ? '#4ade80' : u.rate >= 40 ? '#fbbf24' : '#f87171', 
                                            borderRadius: '3px' 
                                        }} />
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

export default AdminTasksPage;
