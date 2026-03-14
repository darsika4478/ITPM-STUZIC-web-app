import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebase";

const AuthGuard = () => {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    if (user === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--c5)]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[var(--c3)]" />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard;
