import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import logoText from '../assets/logo-text.png';

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
const OverviewLayout = () => {
    const [fullName, setFullName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [initials, setInitials] = useState('');
    const [avatarURL, setAvatarURL] = useState('');
    const navigate = useNavigate();

    // Derives first name and initials from a full name string
    const applyName = (resolvedName) => {
        const name = resolvedName.trim();
        setFullName(name);
        const first = name.split(' ')[0];
        setFirstName(first);
        const parts = name.split(/\s+/);
        const ini = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
        setInitials(ini);
    };

    useEffect(() => {
        let unsubFirestore = null;

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (unsubFirestore) { unsubFirestore(); unsubFirestore = null; }

            if (!user) {
                setFullName(''); setFirstName(''); setInitials(''); setAvatarURL('');
                return;
            }

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
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.35rem 0.5rem 0' }}>
                    <img src={logoText} alt="STUZIC" style={{ width: '190px', height: 'auto', objectFit: 'contain', maxWidth: '100%' }} />
                </div>

                {/* Navigation links */}
                <nav style={{ marginTop: 0, display: 'flex', flex: 1, flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
                    <p style={{ marginBottom: '0.5rem', paddingLeft: '1rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa' }}>
                        Menu
                    </p>
                    <NavLink to="/dashboard" end style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>🏠</span> Overview
                    </NavLink>
                    <NavLink to="/dashboard/tasks" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>📋</span> Task Planner
                    </NavLink>
                    <NavLink to="/dashboard/mood" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>🎵</span> Mood & Music
                    </NavLink>
                    <NavLink to="/dashboard/mood-history" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>🕰️</span> Mood History
                    </NavLink>
                    <NavLink to="/dashboard/study-session" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>⏱️</span> Study Session
                    </NavLink>
                    <NavLink to="/dashboard/mood-analytics" style={({ isActive }) => navLinkStyle(isActive)}>
                        <span style={{ fontSize: '1.125rem' }}>📊</span> Mood Analytics
                    </NavLink>
                    <NavLink to="/dashboard/calendar" style={({ isActive }) => navLinkStyle(isActive)}>
                    <span style={{ fontSize: '1.125rem' }}>📅</span> Schedule & Reminder
                    </NavLink>
                </nav>

                {/* User card + logout */}
                <div style={{ borderTop: '1px solid rgba(109,95,231,0.18)', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <NavLink
                        to="/dashboard/profile"
                        style={({ isActive }) => ({
                            display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            borderRadius: '14px', padding: '12px 14px', textDecoration: 'none',
                            transition: 'all 0.15s',
                            background: isActive ? 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)' : 'linear-gradient(135deg, rgba(109,95,231,0.1), rgba(155,126,248,0.08))',
                            boxShadow: isActive ? '0 6px 22px rgba(109,95,231,0.45)' : '0 6px 22px rgba(0,0,0,0.35)',
                        })}
                    >
                        <div style={{ display: 'flex', height: '42px', width: '42px', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', fontSize: '0.9rem', fontWeight: 700, color: '#fff', border: '2px solid rgba(167,139,250,0.35)', overflow: 'hidden' }}>
                            {avatarURL
                                ? <img src={avatarURL} alt="Avatar" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                : (initials || '??')
                            }
                        </div>
                        <div style={{ minWidth: 0, textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f0ecff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName || firstName || 'User'}</p>
                        </div>
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        style={{ marginTop: '0.1rem', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: '12px', padding: '10px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#f87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer', transition: 'transform 0.12s, box-shadow 0.12s, background 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; e.currentTarget.style.boxShadow = '0 8px 18px rgba(248,113,113,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
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

export default OverviewLayout;
