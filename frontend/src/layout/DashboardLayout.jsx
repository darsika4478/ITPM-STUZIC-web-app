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
            // Clean up previous Firestore listener when user changes
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

            // Set initial values from Auth profile (fast, no network)
            const authName = user.displayName || user.email?.split('@')[0] || '';
            if (authName) applyName(authName.charAt(0).toUpperCase() + authName.slice(1));
            if (user.photoURL) setAvatarURL(user.photoURL);

            // Real-time Firestore listener — updates navbar instantly when profile changes
            unsubFirestore = onSnapshot(doc(db, 'users', user.uid), (snap) => {
                if (!snap.exists()) return;
                const data = snap.data();

                // Resolve name: Firestore > Auth displayName > email prefix
                let resolvedName = data.name || user.displayName || '';
                if (!resolvedName && user.email) {
                    const prefix = user.email.split('@')[0];
                    resolvedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
                }
                applyName(resolvedName);

                // Resolve photo: Firestore > Auth photoURL
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

    const navLinkClasses = ({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-medium transition ${
            isActive
                ? 'bg-[var(--c3)] text-white shadow'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`;

    return (
        <div className="min-h-screen bg-[var(--c5)] text-white">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--c4)]/90 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-full bg-white/10 p-0.5 ring-1 ring-white/20">
                            <img src={logo} alt="STUZIC logo" className="h-14 w-14" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">STUZIC</p>
                            <p className="text-xs text-white/60">Study dashboard</p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2">
                        <NavLink to="/dashboard" className={navLinkClasses} end>
                            Dashboard
                        </NavLink>
                        <NavLink to="/dashboard/tasks" className={navLinkClasses}>
                            Tasks
                        </NavLink>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/profile')}
                            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/10"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#585296] text-sm font-bold text-white ring-2 ring-[#8F8BB6]/40 overflow-hidden">
                                {avatarURL ? (
                                    <img src={avatarURL} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    initials || '??'
                                )}
                            </div>
                            <span className="hidden text-sm font-medium text-white/90 sm:inline">
                                {firstName}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl bg-[var(--c3)] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[var(--c2)]"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
