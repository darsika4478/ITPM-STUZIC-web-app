import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

/**
 * AdminGuard — Route protection for admin pages
 *
 * Checks Firebase auth state AND verifies the user has role: "admin"
 * in the Firestore /users/{uid} document.
 *
 * - While checking: shows loading screen
 * - If not logged in: redirects to /admin/login
 * - If logged in but not admin: redirects to /admin/login with error
 * - If admin: renders child routes via <Outlet />
 */
const AdminGuard = () => {
    const [checking, setChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setIsAdmin(false);
                setChecking(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch {
                setIsAdmin(false);
            }

            setChecking(false);
        });

        return () => unsubscribe();
    }, []);

    if (checking) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #120e30 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px', height: '40px', margin: '0 auto 1rem',
                        border: '3px solid rgba(167,139,250,0.3)',
                        borderTop: '3px solid #a78bfa',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                        Verifying admin access...
                    </p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default AdminGuard;
