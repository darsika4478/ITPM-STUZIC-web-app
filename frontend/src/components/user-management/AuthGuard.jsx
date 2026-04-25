import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { hasAdminRole, loadUserAccess } from '../../utils/userAccess';

/**
 * AuthGuard — Route protection wrapper
 *
 * Listens for Firebase auth state on mount.
 * - While checking: shows a loading screen
 * - If no user: redirects to /login
 * - If admin user: redirects to /admin/dashboard
 * - If regular user: renders child routes via <Outlet />
 *
 * Usage: wrap protected routes with <AuthGuard /> in App.jsx
 */
const AuthGuard = () => {
    const [checking, setChecking] = useState(true);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let isActive = true;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!isActive) return;

            setUser(currentUser);

            if (!currentUser) {
                setIsAdmin(false);
                setChecking(false);
                return;
            }

            try {
                const access = await loadUserAccess(currentUser.uid);
                if (!isActive) return;
                setIsAdmin(hasAdminRole(access));
            } catch {
                if (!isActive) return;
                setIsAdmin(false);
            }

            if (isActive) {
                setChecking(false);
            }
        });

        return () => {
            isActive = false;
            unsubscribe();
        };
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
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Authenticated regular user — render the protected page
    return <Outlet />;
};

export default AuthGuard;
