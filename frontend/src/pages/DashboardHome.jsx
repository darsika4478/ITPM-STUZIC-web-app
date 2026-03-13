import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export default function DashboardHome() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "tasks"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(
            q,
            (snap) => {
                setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            () => setLoading(false)
        );

        return () => unsub();
    }, []);

    const now = new Date();
    const hours = now.getHours();
    const greeting =
        hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";
    const userName = auth.currentUser?.displayName?.split(" ")[0] || "Student";

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = tasks.filter((t) => !t.completed).length;
    const overdue = tasks.filter((t) => {
        if (t.completed || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date(now.toDateString());
    }).length;
    const highPriority = tasks.filter((t) => !t.completed && t.priority === "High").length;

    const dueToday = tasks.filter((t) => {
        if (t.completed || !t.dueDate) return false;
        return t.dueDate === now.toISOString().split("T")[0];
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const recentTasks = tasks.slice(0, 5);

    const getPriorityColor = (p) => {
        switch (p) {
            case "High": return "bg-red-500";
            case "Medium": return "bg-amber-500";
            case "Low": return "bg-green-500";
            default: return "bg-gray-500";
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "No due date";
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const isOverdue = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date(now.toDateString());
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--c3)]" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Greeting */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    {greeting}, {userName} 👋
                </h1>
                <p className="mt-1 text-[var(--c1)]">
                    {total === 0
                        ? "Start by adding your first task!"
                        : `You have ${active} active task${active !== 1 ? "s" : ""}${overdue > 0 ? ` and ${overdue} overdue` : ""}. Keep going!`}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: "Total Tasks", value: total, icon: "📊", color: "from-[var(--c3)] to-[var(--c4)]", textColor: "text-white" },
                    { label: "Completed", value: completed, icon: "✅", color: "from-green-600/20 to-green-500/10", textColor: "text-green-400" },
                    { label: "In Progress", value: active, icon: "⏳", color: "from-amber-600/20 to-amber-500/10", textColor: "text-amber-400" },
                    { label: "Overdue", value: overdue, icon: "🔴", color: "from-red-600/20 to-red-500/10", textColor: "text-red-400" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${s.color} p-5 backdrop-blur`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">{s.icon}</span>
                        </div>
                        <p className={`mt-3 text-3xl font-bold ${s.textColor}`}>{s.value}</p>
                        <p className="mt-0.5 text-xs text-[var(--c1)]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Progress + Quick Info Row */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Completion Progress */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h3 className="text-sm font-semibold text-white">📈 Overall Progress</h3>
                    <div className="mt-4 flex items-end gap-4">
                        {/* Circular progress */}
                        <div className="relative h-24 w-24 shrink-0">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                <circle
                                    cx="50" cy="50" r="42" fill="none"
                                    stroke={completionRate >= 70 ? "#22c55e" : completionRate >= 40 ? "#f59e0b" : "#ef4444"}
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${completionRate * 2.64} ${264 - completionRate * 2.64}`}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                                {completionRate}%
                            </span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-green-400">✅ Completed</span>
                                <span className="font-medium text-white">{completed}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-amber-400">⏳ Active</span>
                                <span className="font-medium text-white">{active}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-red-400">🔴 Overdue</span>
                                <span className="font-medium text-white">{overdue}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Info Cards */}
                <div className="space-y-3">
                    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-lg">📅</span>
                        <div>
                            <p className="text-sm font-semibold text-white">{dueToday} task{dueToday !== 1 ? "s" : ""} due today</p>
                            <p className="text-xs text-[var(--c1)]">Stay on top of your deadlines</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-lg">🔥</span>
                        <div>
                            <p className="text-sm font-semibold text-white">{highPriority} high priority task{highPriority !== 1 ? "s" : ""}</p>
                            <p className="text-xs text-[var(--c1)]">Needs your immediate attention</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/tasks")}
                        className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-[var(--c3)]/30 bg-[var(--c3)]/5 p-4 transition hover:border-[var(--c3)]/50 hover:bg-[var(--c3)]/10"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--c3)]/20 text-lg">＋</span>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Add New Task</p>
                            <p className="text-xs text-[var(--c1)]">Go to Task Planner to create tasks</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Tasks */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">🕐 Recent Tasks</h3>
                    {total > 0 && (
                        <button
                            onClick={() => navigate("/dashboard/tasks")}
                            className="text-xs font-medium text-[var(--c3)] transition hover:text-white"
                        >
                            View all →
                        </button>
                    )}
                </div>

                {recentTasks.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center py-8 text-center">
                        <span className="text-4xl">📝</span>
                        <p className="mt-3 text-sm text-[var(--c1)]">No tasks yet. Head to the Task Planner to get started!</p>
                    </div>
                ) : (
                    <div className="mt-4 space-y-2">
                        {recentTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 transition hover:bg-white/5"
                            >
                                {/* Priority dot */}
                                <span className={`h-2 w-2 shrink-0 rounded-full ${getPriorityColor(task.priority)}`} />

                                {/* Task title */}
                                <p className={`flex-1 truncate text-sm text-white ${task.completed ? "line-through opacity-50" : ""}`}>
                                    {task.title}
                                </p>

                                {/* Status badge */}
                                {task.completed ? (
                                    <span className="rounded-md bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">Done</span>
                                ) : isOverdue(task.dueDate) ? (
                                    <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">Overdue</span>
                                ) : (
                                    <span className="text-[10px] text-[var(--c1)]">{formatDate(task.dueDate)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
