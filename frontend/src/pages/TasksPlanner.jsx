import React, { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
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
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPriority, setFilterPriority] = useState("All");

    // Real-time listener for user's tasks
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "tasks"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const taskList = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                setTasks(taskList);
                setLoading(false);
                setError("");
            },
            (err) => {
                console.error("Firestore error:", err);
                setLoading(false);
                // Check if it's an index error
                if (err.message?.includes("index")) {
                    setError(
                        "Firestore needs a composite index. Check the browser console (F12) for a link to create it automatically."
                    );
                } else {
                    setError("Failed to load tasks: " + err.message);
                }
            }
        );

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

    // Toggle task completion
    const handleToggleComplete = async (taskId, currentStatus) => {
        try {
            await updateDoc(doc(db, "tasks", taskId), {
                completed: !currentStatus,
            });
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    };

    // Delete a task
    const handleDeleteTask = async (taskId) => {
        try {
            await deleteDoc(doc(db, "tasks", taskId));
            setConfirmDelete(null);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
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

    // Filtered tasks based on tab, search, and priority
    const filteredTasks = tasks.filter((t) => {
        // Tab filter
        if (activeTab === "Active" && t.completed) return false;
        if (activeTab === "Completed" && !t.completed) return false;
        if (activeTab === "Overdue" && (t.completed || !isOverdue(t.dueDate))) return false;

        // Priority filter
        if (filterPriority !== "All" && t.priority !== filterPriority) return false;

        // Search filter
        if (searchQuery.trim()) {
            return t.title.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return true;
    });

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

            {/* Error Banner */}
            {error && (
                <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    <p className="font-semibold">⚠️ {error}</p>
                </div>
            )}

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

            {/* Filter & Search Bar */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        { key: "All", label: "All", count: tasks.length, icon: "📊" },
                        { key: "Active", label: "Active", count: activeTasks.length, icon: "⏳" },
                        { key: "Completed", label: "Completed", count: completedTasks.length, icon: "✅" },
                        { key: "Overdue", label: "Overdue", count: overdueTasks.length, icon: "🔴" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
                                activeTab === tab.key
                                    ? "bg-[var(--c3)] text-white shadow-lg shadow-[var(--c3)]/20"
                                    : "bg-white/5 text-[var(--c1)] hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <span className="text-xs">{tab.icon}</span>
                            {tab.label}
                            <span
                                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    activeTab === tab.key
                                        ? "bg-white/20 text-white"
                                        : "bg-white/10 text-[var(--c1)]"
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search & Priority Filter */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <svg
                            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full rounded-xl border border-white/15 bg-white/8 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                    >
                        <option value="All" className="bg-[var(--c5)]">All Priorities</option>
                        <option value="High" className="bg-[var(--c5)]">🔴 High</option>
                        <option value="Medium" className="bg-[var(--c5)]">🟡 Medium</option>
                        <option value="Low" className="bg-[var(--c5)]">🟢 Low</option>
                    </select>
                </div>
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
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
                        <span className="text-5xl">🔍</span>
                        <h3 className="mt-4 text-lg font-semibold text-white">No matching tasks</h3>
                        <p className="mt-1 text-sm text-[var(--c1)]">
                            Try adjusting your filters or search query
                        </p>
                        <button
                            onClick={() => { setActiveTab("All"); setSearchQuery(""); setFilterPriority("All"); }}
                            className="mt-4 rounded-xl bg-white/10 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/8 ${
                                task.completed ? "opacity-50" : ""
                            }`}
                        >
                            {/* Completion checkbox */}
                            <button
                                onClick={() => handleToggleComplete(task.id, task.completed)}
                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                                    task.completed
                                        ? "border-green-500 bg-green-500/20 text-green-400"
                                        : "border-white/20 hover:border-[var(--c3)] hover:bg-[var(--c3)]/10"
                                }`}
                                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                                {task.completed && (
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>

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

                            {/* Delete button */}
                            <div className="shrink-0">
                                {confirmDelete === task.id ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/30"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(null)}
                                            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-[var(--c1)] transition hover:bg-white/15"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDelete(task.id)}
                                        className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100"
                                        title="Delete task"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
