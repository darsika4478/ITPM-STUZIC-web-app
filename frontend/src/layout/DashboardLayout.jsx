import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import logoIcon from '../assets/logo-icon.png';

/**
 * DashboardLayout — Persistent sidebar shell for all dashboard pages
 *
 * Responsibilities:
 *  - Listens to Firebase auth state to populate the user card in the sidebar
 *  - Subscribes to the Firestore /users/{uid} doc for live name + avatar updates
 *  - Renders nav links and logout button
 *  - Wraps all dashboard child routes via <Outlet />
 *
 * Child routes rendered inside <Outlet />:
 *   /dashboard          → DashboardHome
 *   /dashboard/tasks    → TasksPlanner
 *   /dashboard/profile  → MyProfile
 */
const DashboardLayout = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [initials, setInitials] = useState('');
    const [avatarURL, setAvatarURL] = useState('');
    const navigate = useNavigate();

    // Derives first name and initials from a full name string
    const applyName = (resolvedName) => {
        const first = resolvedName.split(' ')[0];
        setFirstName(first);
        const parts = resolvedName.trim().split(/\s+/);
        const ini = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : resolvedName.slice(0, 2).toUpperCase();
        setInitials(ini);
    };

    useEffect(() => {
        let unsubFirestore = null;

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (unsubFirestore) { unsubFirestore(); unsubFirestore = null; }

            if (!user) {
                setEmail(''); setFirstName(''); setInitials(''); setAvatarURL('');
                return;
            }

            setEmail(user.email || '');
            const authName = user.displayName || user.email?.split('@')[0] || '';
            if (authName) applyName(authName.charAt(0).toUpperCase() + authName.slice(1));
            if (user.photoURL) setAvatarURL(user.photoURL);

            unsubFirestore = onSnapshot(doc(db, 'users', user.uid), (snap) => {
                if (!snap.exists()) return;
                const data = snap.data();

                let resolvedName = data.name || user.displayName || '';
                if (!resolvedName && user.email) {
                    const prefix = user.email.split('@')[0];
                    resolvedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
                }
                applyName(resolvedName);
                setAvatarURL(data.photoURL || user.photoURL || '');
            });
        });

        return () => { unsubAuth(); if (unsubFirestore) unsubFirestore(); };
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const navLinkStyle = (isActive) => ({
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        borderRadius: '12px', padding: '10px 16px',
        fontSize: '0.875rem', fontWeight: 500,
        textDecoration: 'none', transition: 'all 0.15s',
        background: isActive ? 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)' : 'transparent',
        color: isActive ? '#fff' : '#c4b5fd',
        boxShadow: isActive ? '0 4px 16px rgba(109,95,231,0.4)' : 'none',
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#1c1848' }}>

            {/* ── Sidebar ── fixed left panel, always visible */}
            <aside style={{
                position: 'fixed', left: 0, top: 0, zIndex: 30,
                display: 'flex', height: '100vh', width: '256px', flexDirection: 'column',
                borderRight: '1px solid rgba(109,95,231,0.2)',
                background: 'rgba(10,8,36,0.96)',
                backdropFilter: 'blur(20px)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
            }}>
                {/* Logo + brand name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', borderBottom: '1px solid rgba(109,95,231,0.18)' }}>
                    <div style={{ display: 'flex', height: '40px', width: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(109,95,231,0.15)', border: '1px solid rgba(167,139,250,0.25)' }}>
                        <img src={logoIcon} alt="STUZIC" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>STUZIC</p>
                        <p style={{ fontSize: '0.625rem', color: '#c4b5fd', margin: 0 }}>Study Dashboard</p>
                    </div>
                </div>

                {/* Navigation links */}
                <nav style={{ marginTop: '1rem', display: 'flex', flex: 1, flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
                    <p style={{ marginBottom: '0.5rem', paddingLeft: '1rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa' }}>
                        Menu
                    </p>
                    <NavLink to="/dashboard" end style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>🏠</span> Dashboard
                    </NavLink>
                    <NavLink to="/dashboard/tasks" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>📋</span> Task Planner
                    </NavLink>
                </nav>

                {/* User card + logout */}
                <div style={{ borderTop: '1px solid rgba(109,95,231,0.18)', padding: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/profile')}
                        style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.75rem', borderRadius: '12px', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(109,95,231,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                        <div style={{ display: 'flex', height: '36px', width: '36px', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', fontSize: '0.875rem', fontWeight: 700, color: '#fff', border: '2px solid rgba(167,139,250,0.3)', overflow: 'hidden' }}>
                            {avatarURL
                                ? <img src={avatarURL} alt="Avatar" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                : (initials || '??')
                            }
                        </div>
                        <div style={{ minWidth: 0, textAlign: 'left' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#f0ecff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName || 'User'}</p>
                            <p style={{ margin: 0, fontSize: '0.6875rem', color: '#c4b5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{ marginTop: '0.25rem', display: 'flex', width: '100%', alignItems: 'center', gap: '0.75rem', borderRadius: '12px', padding: '10px 16px', fontSize: '0.875rem', fontWeight: 500, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                        <span style={{ fontSize: '1.125rem' }}>🚪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main content area ── offset by sidebar width */}
            <main style={{ marginLeft: '256px', flex: 1, minHeight: '100vh' }}>
                <div style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
