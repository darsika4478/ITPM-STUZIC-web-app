export default function DashboardHome() {
    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold text-white">🏠 Dashboard</h1>
            <p className="mt-2 text-[var(--c1)]">Welcome back! Use the sidebar to navigate.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <a
                    href="/dashboard/tasks"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-[var(--c3)]/40 hover:bg-white/10"
                >
                    <span className="text-3xl">📋</span>
                    <h3 className="mt-3 text-lg font-semibold text-white">Task Planner</h3>
                    <p className="mt-1 text-sm text-[var(--c1)]">
                        Manage your assignments, set deadlines & track progress.
                    </p>
                </a>
            </div>
        </div>
    );
}
