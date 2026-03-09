import React, { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

export default function TasksPlanner() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Real-time listener for user's tasks
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "tasks"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const taskList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTasks(taskList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Add a new task
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setAdding(true);
        try {
            await addDoc(collection(db, "tasks"), {
                title: title.trim(),
                dueDate: dueDate || null,
                priority,
                completed: false,
                userId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
            });
            setTitle("");
            setDueDate("");
            setPriority("Medium");
            setShowForm(false);
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task. Please try again.");
        }
        setAdding(false);
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case "High": return "bg-red-500/15 text-red-400 border-red-500/30";
            case "Medium": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
            case "Low": return "bg-green-500/15 text-green-400 border-green-500/30";
            default: return "bg-gray-500/15 text-gray-400";
        }
    };

    const getPriorityDot = (p) => {
        switch (p) {
            case "High": return "bg-red-500";
            case "Medium": return "bg-amber-500";
            case "Low": return "bg-green-500";
            default: return "bg-gray-500";
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "No due date";
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const isOverdue = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date(new Date().toDateString());
    };

    const activeTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);
    const overdueTasks = tasks.filter((t) => !t.completed && isOverdue(t.dueDate));

    return (
        <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">📋 Task Planner</h1>
                    <p className="mt-1 text-[var(--c1)]">
                        Organize your study tasks and stay on track
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--c3)]/20 transition hover:scale-105 active:scale-95"
                >
                    {showForm ? "✕ Cancel" : "＋ New Task"}
                </button>
            </div>

            {/* Add Task Form */}
            {showForm && (
                <form
                    onSubmit={handleAddTask}
                    className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                >
                    <h3 className="mb-4 text-lg font-semibold text-white">Create New Task</h3>

                    <div className="mb-4">
                        <label className="mb-1.5 block text-sm font-medium text-[var(--c1)]">
                            Task Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Complete Math Assignment Chapter 5"
                            className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="mb-5 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[180px]">
                            <label className="mb-1.5 block text-sm font-medium text-[var(--c1)]">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                            />
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className="mb-1.5 block text-sm font-medium text-[var(--c1)]">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                            >
                                <option value="Low" className="bg-[var(--c5)]">🟢 Low</option>
                                <option value="Medium" className="bg-[var(--c5)]">🟡 Medium</option>
                                <option value="High" className="bg-[var(--c5)]">🔴 High</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={adding || !title.trim()}
                        className="w-full rounded-xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {adding ? "Adding..." : "✓ Add Task"}
                    </button>
                </form>
            )}

            {/* Stats Row */}
            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                    { label: "Total", value: tasks.length, color: "text-white", icon: "📊" },
                    { label: "Active", value: activeTasks.length, color: "text-amber-400", icon: "⏳" },
                    { label: "Completed", value: completedTasks.length, color: "text-green-400", icon: "✅" },
                    { label: "Overdue", value: overdueTasks.length, color: "text-red-400", icon: "🔴" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur"
                    >
                        <span className="text-xl">{s.icon}</span>
                        <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-[var(--c1)]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-[var(--c1)]">
                        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--c3)]" />
                        <p>Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
                        <span className="text-5xl">📝</span>
                        <h3 className="mt-4 text-lg font-semibold text-white">No tasks yet</h3>
                        <p className="mt-1 text-sm text-[var(--c1)]">
                            Click "＋ New Task" to create your first task!
                        </p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/8 ${
                                task.completed ? "opacity-50" : ""
                            }`}
                        >
                            {/* Priority dot */}
                            <div className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${getPriorityDot(task.priority)}`} />

                            {/* Task info */}
                            <div className="flex-1 min-w-0">
                                <h4
                                    className={`text-base font-semibold text-white ${
                                        task.completed ? "line-through opacity-70" : ""
                                    }`}
                                >
                                    {task.title}
                                </h4>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}
                                    >
                                        {task.priority}
                                    </span>
                                    <span
                                        className={`text-xs ${
                                            isOverdue(task.dueDate) && !task.completed
                                                ? "text-red-400 font-medium"
                                                : "text-[var(--c1)]"
                                        }`}
                                    >
                                        📅 {formatDate(task.dueDate)}
                                        {isOverdue(task.dueDate) && !task.completed && " (Overdue!)"}
                                    </span>
                                    {task.completed && (
                                        <span className="text-xs font-medium text-green-400">✅ Done</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
