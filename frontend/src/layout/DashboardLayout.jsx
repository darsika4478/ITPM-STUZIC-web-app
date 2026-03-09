import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import logo from '../assets/logo.png';

const DashboardLayout = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [initials, setInitials] = useState('');
    const [avatarURL, setAvatarURL] = useState('');
    const navigate = useNavigate();

    // Helper: derive display values from a name string
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
            if (unsubFirestore) {
                unsubFirestore();
                unsubFirestore = null;
            }

            if (!user) {
                setEmail('');
                setFirstName('');
                setInitials('');
                setAvatarURL('');
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

        return () => {
            unsubAuth();
            if (unsubFirestore) unsubFirestore();
        };
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            isActive
                ? 'bg-[var(--c3)] text-white shadow-lg shadow-[var(--c3)]/20'
                : 'text-[var(--c1)] hover:bg-white/10 hover:text-white'
        }`;

    return (
        <div className="flex min-h-screen bg-[var(--c5)]">
            {/* ── Sidebar ── */}
            <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/10 bg-[var(--c5)]/95 backdrop-blur-xl">
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                        <img src={logo} alt="STUZIC" className="h-9 w-9 object-contain" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">STUZIC</p>
                        <p className="text-[10px] text-white/50">Study Dashboard</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
                    <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Menu
                    </p>
                    <NavLink to="/dashboard" end className={linkClass}>
                        <span className="text-lg">🏠</span> Dashboard
                    </NavLink>
                    <NavLink to="/dashboard/tasks" className={linkClass}>
                        <span className="text-lg">📋</span> Task Planner
                    </NavLink>
                </nav>

                {/* User Card + Logout */}
                <div className="border-t border-white/10 p-3">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/profile')}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/10"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--c3)] to-[var(--c4)] text-sm font-bold text-white ring-2 ring-[var(--c2)]/30 overflow-hidden">
                            {avatarURL ? (
                                <img src={avatarURL} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                initials || '??'
                            )}
                        </div>
                        <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-medium text-white">{firstName || 'User'}</p>
                            <p className="truncate text-[11px] text-white/50">{email}</p>
                        </div>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                        <span className="text-lg">🚪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="ml-64 flex-1 min-h-screen">
                {/* Page Content */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
