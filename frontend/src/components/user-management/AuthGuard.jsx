import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';

/**
 * AuthGuard — Route protection wrapper
 *
 * Listens for Firebase auth state on mount.
 * - While checking: shows a loading screen
 * - If no user: redirects to /login
 * - If logged in: renders child routes via <Outlet />
 *
 * Usage: wrap protected routes with <AuthGuard /> in App.jsx
 */
const AuthGuard = () => {
    // undefined = still checking, null = not logged in, object = logged in
    const [checking, setChecking] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Subscribe to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setChecking(false); // done checking once Firebase responds
        });

        // Clean up listener when component unmounts
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

    // Authenticated — render the protected page
    return <Outlet />;
};

export default AuthGuard;
