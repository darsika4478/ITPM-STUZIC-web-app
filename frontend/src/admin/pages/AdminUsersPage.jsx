import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'Never';
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
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '#a78bfa';
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return '#10b981';
    if (diffDays < 7) return '#f59e0b';
    return '#a78bfa';
};

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [savingUserId, setSavingUserId] = useState('');
    const [formError, setFormError] = useState('');
    
    // Modal states
    const [selectedUser, setSelectedUser] = useState(null);
    const [userActivity, setUserActivity] = useState({ tasks: [], sessions: [], loading: false });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const [usersSnap, moodsSnap, sessionsSnap] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'moods')),
                getDocs(collection(db, 'sessions')),
            ]);

            const moodsData = moodsSnap.docs.map(doc => ({ ...doc.data() }));
            const sessionsData = sessionsSnap.docs.map(doc => ({ ...doc.data() }));

            const rows = usersSnap.docs.map((item) => {
                const userData = { id: item.id, ...item.data() };
                
                if (userData.lastLogin) {
                    userData.lastActive = userData.lastLogin;
                } else {
                    const userMoods = moodsData.filter(m => m.userId === item.id);
                    const userSessions = sessionsData.filter(s => s.userId === item.id);
                    
                    const latestMood = userMoods.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))[0];
                    const latestSession = userSessions.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))[0];
                    
                    const moodTime = latestMood?.createdAt?.toMillis?.() || 0;
                    const sessionTime = latestSession?.createdAt?.toMillis?.() || 0;
                    
                    if (moodTime || sessionTime) {
                        userData.lastActive = moodTime > sessionTime ? latestMood.createdAt : latestSession.createdAt;
                    } else {
                        userData.lastActive = null;
                    }
                }
                
                return userData;
            });
            rows.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
            setUsers(rows);
        } catch (error) {
            console.error('Failed to load users:', error);
            setFormError('Failed to load users. Please refresh and try again.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        const queryText = search.trim().toLowerCase();
        return users.filter((user) => {
            if (user.role === 'admin') return false;
            
            if (!queryText) return true;
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            return name.includes(queryText) || email.includes(queryText);
        });
    }, [users, search]);

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Role', 'Joined', 'Last Login'];
        const csvContent = [
            headers.join(','),
            ...filteredUsers.map(u => [
                `"${u.name || 'N/A'}"`,
                `"${u.email || 'N/A'}"`,
                u.role || 'user',
                `"${u.createdAt?.toDate?.() ? u.createdAt.toDate().toLocaleDateString('en-US') : 'N/A'}"`,
                `"${formatLastLogin(u.lastActive)}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'users_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const loadUserActivity = async (userId) => {
        setUserActivity({ tasks: [], sessions: [], loading: true });
        try {
            const [tasksSnap, sessionsSnap] = await Promise.all([
                getDocs(query(collection(db, 'tasks'), where('userId', '==', userId))),
                getDocs(query(collection(db, 'sessions'), where('userId', '==', userId)))
            ]);
            
            setUserActivity({
                tasks: tasksSnap.docs.map(d => d.data()),
                sessions: sessionsSnap.docs.map(d => d.data()),
                loading: false
            });
        } catch (error) {
            console.error("Error loading activity", error);
            setUserActivity(prev => ({ ...prev, loading: false }));
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        loadUserActivity(user.id);
    };

    const deleteUser = async (user) => {
        const currentAdminId = auth.currentUser?.uid;
        if (user.id === currentAdminId) {
            alert('You cannot delete your own account profile.');
            return;
        }

        const confirmed = window.confirm(`Delete ${user.email || user.name || 'this user'}? This removes the profile and related records.`);
        if (!confirmed) return;

        setSavingUserId(user.id);
        try {
            const relatedCollections = ['tasks', 'moods', 'sessions'];
            for (const name of relatedCollections) {
                const relatedSnap = await getDocs(query(collection(db, name), where('userId', '==', user.id)));
                await Promise.all(relatedSnap.docs.map((item) => deleteDoc(item.ref)));
            }

            await deleteDoc(doc(db, 'users', user.id));
            setUsers((prev) => prev.filter((item) => item.id !== user.id));
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user profile.');
        }
        setSavingUserId('');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading users...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>User Management</h1>
                    <p style={{ fontSize: '0.875rem', color: '#a78bfa', margin: '0.25rem 0 0' }}>Manage Users</p>
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
            
            {formError && <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name/email"
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        borderRadius: '12px',
                        border: '1px solid rgba(109,95,231,0.25)',
                        background: 'rgba(20,14,50,0.6)',
                        color: '#f0ecff',
                        padding: '10px 12px',
                        outline: 'none',
                    }}
                />
            </div>

            <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: '0 0 1rem 0' }}>
                Showing {filteredUsers.length} of {users.filter(u => u.role !== 'admin').length} users
            </p>

            <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                {filteredUsers.length === 0 ? (
                    <p style={{ color: '#a78bfa', margin: 0, textAlign: 'center', padding: '2rem 0' }}>No users found for this search/filter.</p>
                ) : (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr>
                                {['Name', 'Email', 'Joined', 'Last Login', 'Actions'].map((column) => (
                                    <th key={column} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.2)', textTransform: 'uppercase' }}>
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const userRole = user.role || 'user';
                                const isSelf = auth.currentUser?.uid === user.id;
                                return (
                                    <tr key={user.id}>
                                        <td style={{ padding: '0.75rem', color: '#f0ecff', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>{user.name || 'N/A'}</td>
                                        <td style={{ padding: '0.75rem', color: '#c4b5fd', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>{user.email || 'N/A'}</td>
                                        <td style={{ padding: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {user.createdAt?.toDate?.()
                                                ? user.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: getLoginColor(user.lastActive), borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {formatLastLogin(user.lastActive)}
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewDetails(user)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(16,185,129,0.3)',
                                                        background: 'rgba(16,185,129,0.1)',
                                                        color: '#34d399',
                                                        padding: '6px 10px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Details
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={savingUserId === user.id || isSelf}
                                                    onClick={() => deleteUser(user)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(248,113,113,0.35)',
                                                        background: 'rgba(248,113,113,0.12)',
                                                        color: '#fca5a5',
                                                        padding: '6px 10px',
                                                        cursor: 'pointer',
                                                        opacity: isSelf ? 0.5 : 1,
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            {isSelf && <p style={{ margin: '4px 0 0', fontSize: '0.65rem', color: '#a78bfa' }}>Current account</p>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#1a103c', borderRadius: '16px', border: '1px solid rgba(109,95,231,0.3)',
                        width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: '#f0ecff', fontSize: '1.5rem' }}>User Profile: {selectedUser.name}</h2>
                            <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: '#a78bfa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <p style={{ margin: '0 0 0.5rem', color: '#c4b5fd' }}><strong>Email:</strong> {selectedUser.email}</p>
                            <p style={{ margin: '0 0 0.5rem', color: '#c4b5fd' }}><strong>Role:</strong> {selectedUser.role || 'user'}</p>
                            <p style={{ margin: 0, color: '#c4b5fd' }}><strong>Joined:</strong> {selectedUser.createdAt?.toDate?.() ? selectedUser.createdAt.toDate().toLocaleDateString('en-US') : 'N/A'}</p>
                        </div>
                        
                        <h3 style={{ color: '#f0ecff', fontSize: '1.2rem', marginBottom: '1rem' }}>Activity Logs</h3>
                        {userActivity.loading ? (
                            <p style={{ color: '#a78bfa' }}>Loading user activity...</p>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1, padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', color: '#34d399' }}>Tasks Created</h4>
                                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#f0ecff' }}>{userActivity.tasks.length}</p>
                                </div>
                                <div style={{ flex: 1, padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', color: '#60a5fa' }}>Sessions Completed</h4>
                                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#f0ecff' }}>{userActivity.sessions.length}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;