import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import logoText from '../../assets/logo-text.png';

const AdminLayout = () => {
    const [fullName, setFullName] = useState('');
    const [initials, setInitials] = useState('');
    const [avatarURL, setAvatarURL] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let unsubFirestore = null;

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (unsubFirestore) { unsubFirestore(); unsubFirestore = null; }

            if (!user) {
                setFullName(''); setInitials(''); setAvatarURL('');
                return;
            }

            const authName = user.displayName || user.email?.split('@')[0] || '';
            if (authName) applyName(authName);
            if (user.photoURL) setAvatarURL(user.photoURL);

            unsubFirestore = onSnapshot(doc(db, 'users', user.uid), (snap) => {
                if (!snap.exists()) return;
                const data = snap.data();
                const resolvedName = data.name || user.displayName || user.email?.split('@')[0] || '';
                applyName(resolvedName);
                setAvatarURL(data.photoURL || user.photoURL || '');
            });
        });

        return () => { unsubAuth(); if (unsubFirestore) unsubFirestore(); };
    }, []);

    const applyName = (name) => {
        const trimmed = name.trim();
        setFullName(trimmed);
        const parts = trimmed.split(/\s+/);
        const ini = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : trimmed.slice(0, 2).toUpperCase();
        setInitials(ini);
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/admin/login');
    };

    const navLinkStyle = (isActive) => ({
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        borderRadius: '12px', padding: '10px 16px',
        fontSize: '0.875rem', fontWeight: 500,
        textDecoration: 'none', transition: 'all 0.15s',
        background: isActive ? 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)' : 'transparent',
        color: isActive ? '#fff' : '#fca5a5',
        boxShadow: isActive ? '0 4px 16px rgba(220,38,38,0.4)' : 'none',
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0a2e' }}>

            {/* Admin Sidebar */}
            <aside style={{
                position: 'fixed', left: 0, top: 0, zIndex: 30,
                display: 'flex', height: '100vh', width: '260px', flexDirection: 'column',
                borderRight: '1px solid rgba(248,113,113,0.15)',
                background: 'rgba(8,5,25,0.97)',
                backdropFilter: 'blur(20px)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
            }}>
                {/* Logo + Admin badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.35rem 0.5rem 0' }}>
                    <img src={logoText} alt="STUZIC" style={{ width: '170px', height: 'auto', objectFit: 'contain' }} />
                    <div style={{
                        marginTop: '-4px',
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '3px 12px', borderRadius: '12px',
                        background: 'rgba(248,113,113,0.12)',
                        border: '1px solid rgba(248,113,113,0.25)',
                    }}>
                        <span style={{ fontSize: '0.6rem' }}>🛡️</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Admin Panel
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ marginTop: '1rem', display: 'flex', flex: 1, flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
                    <p style={{ marginBottom: '0.5rem', paddingLeft: '1rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f87171' }}>
                        Management
                    </p>
                    <NavLink to="/admin/dashboard" end style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>📊</span> Dashboard
                    </NavLink>
                    <NavLink to="/admin/users" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>👥</span> User Management
                    </NavLink>
                    <NavLink to="/admin/tasks" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>📋</span> Task Reports
                    </NavLink>
                    <NavLink to="/admin/mood-reports" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>🎭</span> Mood Reports
                    </NavLink>
                    <NavLink to="/admin/sessions" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>⏱️</span> Session Reports
                    </NavLink>
                </nav>

                {/* Admin user card + logout */}
                <div style={{ borderTop: '1px solid rgba(248,113,113,0.12)', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                        borderRadius: '14px', padding: '12px 14px',
                        background: 'linear-gradient(135deg, rgba(248,113,113,0.08), rgba(220,38,38,0.06))',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{
                            display: 'flex', height: '40px', width: '40px', flexShrink: 0,
                            alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
                            fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                            border: '2px solid rgba(248,113,113,0.35)', overflow: 'hidden',
                        }}>
                            {avatarURL
                                ? <img src={avatarURL} alt="Avatar" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                : (initials || '??')
                            }
                        </div>
                        <div style={{ minWidth: 0, textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f0ecff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {fullName || 'Admin'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: '#f87171', fontWeight: 600 }}>Administrator</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            marginTop: '0.1rem', display: 'flex', width: '100%',
                            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            borderRadius: '12px', padding: '10px 16px',
                            fontSize: '0.9rem', fontWeight: 600, color: '#f87171',
                            background: 'rgba(248,113,113,0.1)',
                            border: '1px solid rgba(248,113,113,0.2)',
                            cursor: 'pointer',
                            transition: 'transform 0.12s, box-shadow 0.12s, background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.18)'; e.currentTarget.style.boxShadow = '0 8px 18px rgba(248,113,113,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span style={{ fontSize: '1.125rem' }}>🚪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh' }}>
                <div style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
