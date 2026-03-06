import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';

const AuthGuard = () => {
    const [checking, setChecking] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setChecking(false);
        });

        return () => unsubscribe();
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-[var(--c5)] text-white flex items-center justify-center">
                <p className="text-sm text-white/70">Loading dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default AuthGuard;
