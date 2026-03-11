import React, { useState, useEffect, useRef, useCallback } from "react";
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
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Undo / Redo history
    const historyRef = useRef([{ title: "", description: "" }]);
    const historyIndexRef = useRef(0);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const pushHistory = useCallback((t, d) => {
        const idx = historyIndexRef.current;
        // Trim any forward history
        historyRef.current = historyRef.current.slice(0, idx + 1);
        historyRef.current.push({ title: t, description: d });
        historyIndexRef.current = historyRef.current.length - 1;
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(false);
    }, []);

    const handleUndo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        const snap = historyRef.current[historyIndexRef.current];
        setTitle(snap.title);
        setDescription(snap.description);
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(true);
    }, []);

    const handleRedo = useCallback(() => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        const snap = historyRef.current[historyIndexRef.current];
        setTitle(snap.title);
        setDescription(snap.description);
        setCanUndo(true);
        setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }, []);

    // Keyboard shortcut: Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z = redo
    useEffect(() => {
        if (!showForm) return;
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "z") {
                e.preventDefault();
                if (e.shiftKey) handleRedo();
                else handleUndo();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [showForm, handleUndo, handleRedo]);
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
                description: description.trim() || null,
                dueDate: dueDate || null,
                priority,
                completed: false,
                userId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
            });
            setTitle("");
            setDescription("");
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
            const q = searchQuery.toLowerCase();
            return (
                t.title.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q))
            );
        }

        return true;
    });

    return (
        <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">📋 Task Planner</h1>
                <p className="mt-1 text-[var(--c1)]">
                    Organize your study tasks and stay on track
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    <p className="font-semibold">⚠️ {error}</p>
                </div>
            )}

            {/* Keep-style Task Input Bar */}
            <div className="mb-8">
                {!showForm ? (
                    /* Collapsed bar */
                    <div
                        onClick={() => setShowForm(true)}
                        className="flex cursor-text items-center rounded-2xl border border-white/15 bg-white/5 px-5 py-4 shadow-lg shadow-black/10 transition hover:border-white/25 hover:bg-white/8"
                    >
                        <span className="flex-1 text-sm text-white/35">Take a note...</span>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg p-1.5 text-white/25 transition hover:bg-white/10 hover:text-white/50" title="New task">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </span>
                        </div>
                    </div>
                ) : (
                    /* Expanded form */
                    <form
                        onSubmit={handleAddTask}
                        className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-xl shadow-black/15 backdrop-blur-xl transition-all"
                    >
                        {/* Title input */}
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                const v = e.target.value;
                                setTitle(v);
                                pushHistory(v, description);
                            }}
                            placeholder="Title"
                            className="w-full border-none bg-transparent px-5 pt-4 pb-1 text-base font-semibold text-white placeholder-white/30 outline-none"
                            autoFocus
                        />

                        {/* Description textarea */}
                        <textarea
                            value={description}
                            onChange={(e) => {
                                const v = e.target.value;
                                setDescription(v);
                                pushHistory(title, v);
                            }}
                            placeholder="Take a note..."
                            rows={2}
                            className="w-full border-none bg-transparent px-5 pt-1 pb-3 text-sm text-white/80 placeholder-white/25 outline-none resize-none"
                        />

                        {/* Bottom toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Priority pills */}
                                {["Low", "Medium", "High"].map((p) => {
                                    const colors = {
                                        Low: priority === "Low" ? "bg-green-500/25 text-green-400 border-green-500/40" : "bg-white/5 text-white/40 border-white/10 hover:bg-green-500/10 hover:text-green-400",
                                        Medium: priority === "Medium" ? "bg-amber-500/25 text-amber-400 border-amber-500/40" : "bg-white/5 text-white/40 border-white/10 hover:bg-amber-500/10 hover:text-amber-400",
                                        High: priority === "High" ? "bg-red-500/25 text-red-400 border-red-500/40" : "bg-white/5 text-white/40 border-white/10 hover:bg-red-500/10 hover:text-red-400",
                                    };
                                    const dots = { Low: "🟢", Medium: "🟡", High: "🔴" };
                                    return (
                                        <button
                                            type="button"
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${colors[p]}`}
                                        >
                                            {dots[p]} {p}
                                        </button>
                                    );
                                })}

                                {/* Date picker */}
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium outline-none transition ${
                                            dueDate
                                                ? "border-[var(--c3)]/40 bg-[var(--c3)]/15 text-[var(--c3)]"
                                                : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
                                        }`}
                                    />
                                </div>
                                {/* Undo / Redo */}
                                <div className="flex items-center gap-0.5 ml-1 border-l border-white/10 pl-2">
                                    <button
                                        type="button"
                                        onClick={handleUndo}
                                        disabled={!canUndo}
                                        className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/30"
                                        title="Undo (⌘Z)"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRedo}
                                        disabled={!canRedo}
                                        className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/30"
                                        title="Redo (⌘⇧Z)"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setTitle("");
                                        setDescription("");
                                        setDueDate("");
                                        setPriority("Medium");
                                        historyRef.current = [{ title: "", description: "" }];
                                        historyIndexRef.current = 0;
                                        setCanUndo(false);
                                        setCanRedo(false);
                                    }}
                                    className="rounded-lg px-4 py-1.5 text-xs font-medium text-[var(--c1)] transition hover:bg-white/10 hover:text-white"
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding || !title.trim()}
                                    className="rounded-lg bg-[var(--c3)] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--c3)]/80 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {adding ? "Adding..." : "Add"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

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

            {/* Task Cards */}
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
                <div className="grid gap-4 sm:grid-cols-2">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition hover:bg-white/8 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 ${
                                task.completed ? "opacity-60" : ""
                            }`}
                        >
                            {/* Priority color strip on top */}
                            <div className={`h-1.5 w-full ${
                                task.priority === "High" ? "bg-gradient-to-r from-red-500 to-red-400" :
                                task.priority === "Medium" ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                                "bg-gradient-to-r from-green-500 to-green-400"
                            }`} />

                            <div className="p-5">
                                {/* Card Header: checkbox + title + delete */}
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => handleToggleComplete(task.id, task.completed)}
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                                            task.completed
                                                ? "border-green-500 bg-green-500/20 text-green-400"
                                                : "border-white/25 hover:border-[var(--c3)] hover:bg-[var(--c3)]/10"
                                        }`}
                                        title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                    >
                                        {task.completed && (
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>

                                    <h4 className={`flex-1 text-sm font-semibold leading-snug text-white ${
                                        task.completed ? "line-through opacity-70" : ""
                                    }`}>
                                        {task.title}
                                    </h4>

                                    {/* Delete */}
                                    <div className="shrink-0">
                                        {confirmDelete === task.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/30"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(null)}
                                                    className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-[var(--c1)] transition hover:bg-white/15"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDelete(task.id)}
                                                className="rounded-lg p-1.5 text-white/20 transition hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100"
                                                title="Delete task"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {task.description && (
                                    <p className={`mt-2.5 ml-8 text-xs leading-relaxed text-[var(--c1)] ${
                                        task.completed ? "line-through opacity-60" : ""
                                    }`}>
                                        {task.description.length > 120
                                            ? task.description.slice(0, 120) + "..."
                                            : task.description}
                                    </p>
                                )}

                                {/* Card Footer: badges */}
                                <div className="mt-4 ml-8 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium ${getPriorityColor(task.priority)}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${getPriorityDot(task.priority)}`} />
                                        {task.priority}
                                    </span>

                                    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] ${
                                        isOverdue(task.dueDate) && !task.completed
                                            ? "bg-red-500/10 text-red-400 font-medium"
                                            : "bg-white/5 text-[var(--c1)]"
                                    }`}>
                                        📅 {formatDate(task.dueDate)}
                                        {isOverdue(task.dueDate) && !task.completed && " • Overdue"}
                                    </span>

                                    {task.completed && (
                                        <span className="rounded-lg bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-400">
                                            ✅ Done
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
