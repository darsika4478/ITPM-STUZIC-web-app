import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export default function DashboardLayout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            isActive
                ? "bg-[var(--c3)] text-white shadow-lg shadow-[var(--c3)]/20"
                : "text-[var(--c1)] hover:bg-white/10 hover:text-white"
        }`;

    return (
        <div className="flex min-h-screen bg-[var(--c5)]">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-white/10 bg-[var(--c5)]/95 backdrop-blur-xl">
                {/* Logo (text-based — will be replaced with logo.png after merge) */}
                <div className="flex items-center gap-2 px-5 py-5">
                    <span className="text-2xl font-bold bg-gradient-to-r from-[var(--c2)] to-[var(--c3)] bg-clip-text text-transparent">
                        STUZIC
                    </span>
                </div>

                {/* Nav Links */}
                <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
                    <NavLink to="/dashboard" end className={linkClass}>
                        <span className="text-lg">🏠</span> Dashboard
                    </NavLink>
                    <NavLink to="/dashboard/tasks" className={linkClass}>
                        <span className="text-lg">📋</span> Task Planner
                    </NavLink>
                </nav>

                {/* Logout */}
                <div className="border-t border-white/10 p-3">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                        <span className="text-lg">🚪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-60 flex-1 min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[var(--c5)]/80 px-8 py-4 backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">STUZIC Dashboard</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-[var(--c1)]">
                            {auth.currentUser?.displayName || auth.currentUser?.email}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--c3)] to-[var(--c4)] text-sm font-bold text-white">
                            {(auth.currentUser?.displayName || auth.currentUser?.email || "U").charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
