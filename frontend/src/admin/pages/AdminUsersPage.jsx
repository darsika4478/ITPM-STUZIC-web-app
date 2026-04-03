import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [savingUserId, setSavingUserId] = useState('');
    const [formMode, setFormMode] = useState('create');
    const [editingUserId, setEditingUserId] = useState('');
    const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'user', password: '' });
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'users'));
            const rows = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
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
            const role = user.role || 'user';
            if (roleFilter !== 'all' && role !== roleFilter) return false;
            if (!queryText) return true;
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            return name.includes(queryText) || email.includes(queryText);
        });
    }, [users, search, roleFilter]);

    const updateRole = async (targetUserId, nextRole) => {
        const currentAdminId = auth.currentUser?.uid;
        if (targetUserId === currentAdminId && nextRole !== 'admin') {
            return;
        }

        setSavingUserId(targetUserId);
        try {
            await updateDoc(doc(db, 'users', targetUserId), { role: nextRole });
            setUsers((prev) => prev.map((user) => (
                user.id === targetUserId ? { ...user, role: nextRole } : user
            )));
        } catch (error) {
            console.error('Failed to update role:', error);
        }
        setSavingUserId('');
    };

    const resetMessages = () => {
        setFormError('');
        setFormSuccess('');
    };

    const createUser = async (event) => {
        event.preventDefault();
        resetMessages();

        const name = createForm.name.trim();
        const email = createForm.email.trim().toLowerCase();
        const role = createForm.role;
        const password = createForm.password;

        if (!name || !email || !password) {
            setFormError('Name, email, and password are required.');
            return;
        }
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters.');
            return;
        }

        setSavingUserId('creating');
        try {
            const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
            if (!apiKey) {
                throw new Error('Missing VITE_FIREBASE_API_KEY in frontend environment variables.');
            }

            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, returnSecureToken: true }),
            });

            const result = await response.json();
            if (!response.ok || !result.localId) {
                throw new Error(result.error?.message || 'Unable to create auth account.');
            }

            await setDoc(doc(db, 'users', result.localId), {
                name,
                email,
                role,
                createdAt: serverTimestamp(),
                createdByAdmin: auth.currentUser?.uid || null,
            });

            setCreateForm({ name: '', email: '', role: 'user', password: '' });
            setFormSuccess('User created successfully.');
            await fetchUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
            setFormError(error.message || 'Failed to create user.');
        }
        setSavingUserId('');
    };

    const startEdit = (user) => {
        resetMessages();
        setFormMode('edit');
        setEditingUserId(user.id);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'user',
        });
    };

    const cancelEdit = () => {
        setFormMode('create');
        setEditingUserId('');
        setEditForm({ name: '', email: '', role: 'user' });
        resetMessages();
    };

    const saveEdit = async (event) => {
        event.preventDefault();
        resetMessages();

        if (!editingUserId) return;

        const currentAdminId = auth.currentUser?.uid;
        if (editingUserId === currentAdminId && editForm.role !== 'admin') {
            setFormError('You cannot remove your own admin access.');
            return;
        }

        const name = editForm.name.trim();
        const email = editForm.email.trim().toLowerCase();
        if (!name || !email) {
            setFormError('Name and email are required.');
            return;
        }

        setSavingUserId(editingUserId);
        try {
            await updateDoc(doc(db, 'users', editingUserId), {
                name,
                email,
                role: editForm.role,
                updatedAt: serverTimestamp(),
                updatedByAdmin: currentAdminId || null,
            });

            setUsers((prev) => prev.map((user) => (
                user.id === editingUserId
                    ? { ...user, name, email, role: editForm.role }
                    : user
            )));

            setFormSuccess('User details updated successfully.');
            cancelEdit();
        } catch (error) {
            console.error('Failed to update user:', error);
            setFormError('Failed to update user details.');
        }
        setSavingUserId('');
    };

    const deleteUser = async (user) => {
        const currentAdminId = auth.currentUser?.uid;
        if (user.id === currentAdminId) {
            setFormError('You cannot delete your own account profile.');
            return;
        }

        const confirmed = window.confirm(`Delete ${user.email || user.name || 'this user'}? This removes the profile and related records.`);
        if (!confirmed) return;

        resetMessages();
        setSavingUserId(user.id);
        try {
            const relatedCollections = ['tasks', 'moods', 'sessions'];
            for (const name of relatedCollections) {
                const relatedSnap = await getDocs(query(collection(db, name), where('userId', '==', user.id)));
                await Promise.all(relatedSnap.docs.map((item) => deleteDoc(item.ref)));
            }

            await deleteDoc(doc(db, 'users', user.id));
            setUsers((prev) => prev.filter((item) => item.id !== user.id));
            setFormSuccess('User profile deleted successfully.');
        } catch (error) {
            console.error('Failed to delete user:', error);
            setFormError('Failed to delete user profile.');
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
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>User Management</h1>
                <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                    Create, edit, delete, and manage account roles.
                </p>
            </div>

            <form
                onSubmit={formMode === 'create' ? createUser : saveEdit}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: '16px',
                    background: 'rgba(20,14,50,0.6)',
                    border: '1px solid rgba(109,95,231,0.15)',
                    marginBottom: '1rem',
                }}
            >
                <input
                    value={formMode === 'create' ? createForm.name : editForm.name}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (formMode === 'create') setCreateForm((prev) => ({ ...prev, name: value }));
                        else setEditForm((prev) => ({ ...prev, name: value }));
                    }}
                    placeholder="Full name"
                    style={{
                        borderRadius: '12px',
                        border: '1px solid rgba(248,113,113,0.25)',
                        background: 'rgba(20,14,50,0.7)',
                        color: '#f0ecff',
                        padding: '10px 12px',
                        outline: 'none',
                    }}
                />
                <input
                    type="email"
                    value={formMode === 'create' ? createForm.email : editForm.email}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (formMode === 'create') setCreateForm((prev) => ({ ...prev, email: value }));
                        else setEditForm((prev) => ({ ...prev, email: value }));
                    }}
                    placeholder="Email address"
                    style={{
                        borderRadius: '12px',
                        border: '1px solid rgba(248,113,113,0.25)',
                        background: 'rgba(20,14,50,0.7)',
                        color: '#f0ecff',
                        padding: '10px 12px',
                        outline: 'none',
                    }}
                />
                <select
                    value={formMode === 'create' ? createForm.role : editForm.role}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (formMode === 'create') setCreateForm((prev) => ({ ...prev, role: value }));
                        else setEditForm((prev) => ({ ...prev, role: value }));
                    }}
                    style={{
                        borderRadius: '12px',
                        border: '1px solid rgba(248,113,113,0.25)',
                        background: 'rgba(20,14,50,0.7)',
                        color: '#f0ecff',
                        padding: '10px 12px',
                        outline: 'none',
                    }}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                {formMode === 'create' && (
                    <input
                        type="password"
                        value={createForm.password}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder="Temporary password"
                        style={{
                            borderRadius: '12px',
                            border: '1px solid rgba(248,113,113,0.25)',
                            background: 'rgba(20,14,50,0.7)',
                            color: '#f0ecff',
                            padding: '10px 12px',
                            outline: 'none',
                        }}
                    />
                )}

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        type="submit"
                        disabled={savingUserId === 'creating' || !!savingUserId}
                        style={{
                            borderRadius: '10px',
                            border: '1px solid rgba(248,113,113,0.35)',
                            background: 'rgba(248,113,113,0.16)',
                            color: '#f0ecff',
                            padding: '9px 14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: savingUserId ? 0.7 : 1,
                        }}
                    >
                        {formMode === 'create' ? 'Create User' : 'Save Changes'}
                    </button>

                    {formMode === 'edit' && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            style={{
                                borderRadius: '10px',
                                border: '1px solid rgba(167,139,250,0.35)',
                                background: 'rgba(109,95,231,0.12)',
                                color: '#c4b5fd',
                                padding: '9px 14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {(formError || formSuccess) && (
                    <p style={{
                        margin: 0,
                        gridColumn: '1 / -1',
                        fontSize: '0.82rem',
                        color: formError ? '#f87171' : '#34d399',
                    }}>
                        {formError || formSuccess}
                    </p>
                )}
            </form>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name/email"
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        borderRadius: '12px',
                        border: '1px solid rgba(248,113,113,0.25)',
                        background: 'rgba(20,14,50,0.6)',
                        color: '#f0ecff',
                        padding: '10px 12px',
                        outline: 'none',
                    }}
                />
                <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    style={{
                        borderRadius: '12px',
                        border: '1px solid rgba(248,113,113,0.25)',
                        background: 'rgba(20,14,50,0.6)',
                        color: '#f0ecff',
                        padding: '10px 12px',
                        outline: 'none',
                    }}
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="user">Users</option>
                </select>
            </div>

            <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(20,14,50,0.6)', border: '1px solid rgba(109,95,231,0.15)' }}>
                {filteredUsers.length === 0 ? (
                    <p style={{ color: '#a78bfa', margin: 0 }}>No users found for this filter.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((column) => (
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
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '8px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: userRole === 'admin' ? 'rgba(248,113,113,0.15)' : 'rgba(109,95,231,0.15)',
                                                color: userRole === 'admin' ? '#f87171' : '#a78bfa',
                                            }}>
                                                {userRole}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#a78bfa', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            {user.createdAt?.toDate?.()
                                                ? user.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(109,95,231,0.08)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <select
                                                    value={userRole}
                                                    disabled={savingUserId === user.id || isSelf}
                                                    onChange={(event) => updateRole(user.id, event.target.value)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(248,113,113,0.25)',
                                                        background: 'rgba(20,14,50,0.7)',
                                                        color: '#f0ecff',
                                                        padding: '6px 8px',
                                                        outline: 'none',
                                                        opacity: isSelf ? 0.6 : 1,
                                                    }}
                                                >
                                                    <option value="user">Set as User</option>
                                                    <option value="admin">Set as Admin</option>
                                                </select>

                                                <button
                                                    type="button"
                                                    disabled={!!savingUserId}
                                                    onClick={() => startEdit(user)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(167,139,250,0.35)',
                                                        background: 'rgba(109,95,231,0.12)',
                                                        color: '#c4b5fd',
                                                        padding: '6px 10px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Edit
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
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;