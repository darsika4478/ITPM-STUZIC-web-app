import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

/**
 * AuthGuard — Route protection wrapper
 *
 * Listens for Firebase auth state on mount.
 * - While checking: shows a loading screen
 * - If no user: redirects to /login
 * - If admin user: redirects to /admin/users
 * - If regular user: renders child routes via <Outlet />
 *
 * Usage: wrap protected routes with <AuthGuard /> in App.jsx
 */
const AuthGuard = () => {
    const [checking, setChecking] = useState(true);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    setIsAdmin(userDoc.exists() && userDoc.data().role === 'admin');
                } catch {
                    setIsAdmin(false);
                }
            }
            setChecking(false);
        });

        return () => unsubscribe();
    }, []);

    // Show spinner while Firebase resolves the auth state
    if (checking) {
        return (
            <div className="min-h-screen bg-[var(--c5)] text-white flex items-center justify-center">
                <p className="text-sm text-white/70">Loading dashboard...</p>
            </div>
        );
    }

    // Not authenticated — redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admin accounts should not access the student dashboard
    if (isAdmin) {
        return <Navigate to="/admin/users" replace />;
    }

    // Authenticated regular user — render the protected page
    return <Outlet />;
};

export default AuthGuard;
