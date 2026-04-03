import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${dueDate}T00:00:00`);
    return due < today;
};

const AdminTasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'tasks')),
                    getDocs(collection(db, 'users')),
                ]);

                const taskRows = tasksSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
                const userRows = usersSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
                taskRows.sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || 0;
                    const bTime = b.createdAt?.toMillis?.() || 0;
                    return bTime - aTime;
                });

                setTasks(taskRows);
                setUsers(userRows);
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

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((task) => task.completed).length;
        const active = total - completed;
        const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.completed)).length;
        const highPriority = tasks.filter((task) => task.priority === 'High' && !task.completed).length;
        return { total, completed, active, overdue, highPriority };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const queryText = search.trim().toLowerCase();
        return tasks.filter((task) => {
            const owner = userMap[task.userId] || task.userId || '';
            const matchesSearch = !queryText
                || (task.title || '').toLowerCase().includes(queryText)
                || owner.toLowerCase().includes(queryText);
            if (!matchesSearch) return false;

            if (priorityFilter !== 'all' && (task.priority || 'Medium') !== priorityFilter) return false;

            if (statusFilter === 'completed' && !task.completed) return false;
            if (statusFilter === 'active' && task.completed) return false;
            if (statusFilter === 'overdue' && !isOverdue(task.dueDate, task.completed)) return false;

            return true;
        });
    }, [tasks, search, statusFilter, priorityFilter, userMap]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading task reports...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>Task Reports</h1>
                <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                    Analyze task completion, overdue items, and workload trends.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {[
                    { label: 'Total Tasks', value: stats.total, icon: '📋', color: '#6d5fe7' },
                    { label: 'Completed', value: stats.completed, icon: '✅', color: '#22c55e' },
                    { label: 'Active', value: stats.active, icon: '⏳', color: '#f59e0b' },
                    { label: 'Overdue', value: stats.overdue, icon: '🚨', color: '#ef4444' },
                    { label: 'High Priority', value: stats.highPriority, icon: '🔴', color: '#f87171' },
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
                    placeholder="Search task title or owner"
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
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    style={{ borderRadius: '12px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(20,14,50,0.6)', color: '#f0ecff', padding: '10px 12px', outline: 'none' }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value)}
                    style={{ borderRadius: '12px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(20,14,50,0.6)', color: '#f0ecff', padding: '10px 12px', outline: 'none' }}
                >
                    <option value="all">All Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                {filteredTasks.length === 0 ? (
                    <p style={{ color: '#a78bfa', margin: 0 }}>No tasks found for this filter.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Task', 'Owner', 'Priority', 'Status', 'Due Date'].map((column) => (
                                    <th key={column} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.2)', textTransform: 'uppercase' }}>
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task) => {
                                const overdue = isOverdue(task.dueDate, task.completed);
                                const priority = task.priority || 'Medium';
                                return (
                                    <tr key={task.id}>
                                        <td style={{ padding: '0.75rem', color: '#f0ecff', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>{task.title || 'Untitled Task'}</td>
                                        <td style={{ padding: '0.75rem', color: '#c4b5fd', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>{userMap[task.userId] || 'Unknown user'}</td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '8px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: priority === 'High' ? 'rgba(248,113,113,0.15)' : priority === 'Low' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                                color: priority === 'High' ? '#f87171' : priority === 'Low' ? '#4ade80' : '#fbbf24',
                                            }}>
                                                {priority}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '8px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: task.completed ? 'rgba(34,197,94,0.15)' : overdue ? 'rgba(248,113,113,0.15)' : 'rgba(109,95,231,0.15)',
                                                color: task.completed ? '#4ade80' : overdue ? '#f87171' : '#a78bfa',
                                            }}>
                                                {task.completed ? 'Completed' : overdue ? 'Overdue' : 'Active'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', color: overdue ? '#f87171' : '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {task.dueDate || 'N/A'}
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

export default AdminTasksPage;