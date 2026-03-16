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

    // Edit task state
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDueDate, setEditDueDate] = useState("");
    const [editPriority, setEditPriority] = useState("Medium");
    const [updating, setUpdating] = useState(false);

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
                const taskList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setTasks(taskList);
                setLoading(false);
                setError("");
            },
            (err) => {
                console.error("Firestore error:", err);
                setLoading(false);
                if (err.message?.includes("index")) {
                    setError("Firestore needs a composite index. Check the browser console (F12) for a link to create it automatically.");
                } else {
                    setError("Failed to load tasks: " + err.message);
                }
            }
        );

        return () => unsubscribe();
    }, []);

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
            setTitle(""); setDescription(""); setDueDate(""); setPriority("Medium");
            setShowForm(false);
        } catch (err) {
            console.error("Error adding task:", err);
            alert("Failed to add task. Please try again.");
        }
        setAdding(false);
    };

    const handleToggleComplete = async (taskId, currentStatus) => {
        try {
            await updateDoc(doc(db, "tasks", taskId), { completed: !currentStatus });
        } catch (err) {
            console.error("Error toggling task:", err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteDoc(doc(db, "tasks", taskId));
            setConfirmDelete(null);
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditDueDate(task.dueDate || "");
        setEditPriority(task.priority);
    };

    const closeEditModal = () => {
        setEditingTask(null);
        setEditTitle(""); setEditDescription(""); setEditDueDate(""); setEditPriority("Medium");
        setUpdating(false);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!editTitle.trim() || !editingTask) return;
        setUpdating(true);
        try {
            await updateDoc(doc(db, "tasks", editingTask.id), {
                title: editTitle.trim(),
                description: editDescription.trim() || null,
                dueDate: editDueDate || null,
                priority: editPriority,
            });
            closeEditModal();
        } catch (err) {
            console.error("Error updating task:", err);
            alert("Failed to update task. Please try again.");
            setUpdating(false);
        }
    };

    const getPriorityBadgeStyle = (p) => {
        switch (p) {
            case "High":   return { background: 'rgba(239,68,68,0.15)',   color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' };
            case "Medium": return { background: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' };
            case "Low":    return { background: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' };
            default:       return { background: 'rgba(156,163,175,0.15)', color: '#9ca3af' };
        }
    };

    const getPriorityDotColor = (p) => {
        switch (p) {
            case "High":   return '#ef4444';
            case "Medium": return '#f59e0b';
            case "Low":    return '#22c55e';
            default:       return '#6b7280';
        }
    };

    const getPriorityStripStyle = (p) => {
        switch (p) {
            case "High":   return { background: 'linear-gradient(to right, #ef4444, #f87171)' };
            case "Medium": return { background: 'linear-gradient(to right, #f59e0b, #fbbf24)' };
            default:       return { background: 'linear-gradient(to right, #22c55e, #4ade80)' };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "No due date";
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const isOverdue = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date(new Date().toDateString());
    };

    const activeTasks    = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);
    const overdueTasks   = tasks.filter((t) => !t.completed && isOverdue(t.dueDate));

    const filteredTasks = tasks.filter((t) => {
        if (activeTab === "Active"    && t.completed) return false;
        if (activeTab === "Completed" && !t.completed) return false;
        if (activeTab === "Overdue"   && (t.completed || !isOverdue(t.dueDate))) return false;
        if (filterPriority !== "All"  && t.priority !== filterPriority) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
        }
        return true;
    });

    // ── Shared style tokens ──
    const cardStyle = {
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '20px',
        border: '1px solid rgba(167,139,250,0.15)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    };

    const inputStyle = {
        width: '100%', padding: '10px 16px',
        borderRadius: '12px', fontSize: '0.875rem',
        border: '1.5px solid rgba(167,139,250,0.35)',
        background: 'rgba(255,255,255,0.07)', color: '#f0ecff',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        display: 'block', fontSize: '0.85rem',
        fontWeight: 600, color: '#c4b5fd', marginBottom: '6px',
    };

    return (
        <div style={{
            margin: '-2rem', padding: '2rem', minHeight: '100vh',
            background: 'linear-gradient(135deg, #1c1848 0%, #231f5c 50%, #2b2570 100%)',
        }}>
            <div style={{ maxWidth: '896px', margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>📋 Task Planner</h1>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#a78bfa', marginBottom: 0 }}>
                        Organize your study tasks and stay on track
                    </p>
                </div>

                {/* ── Error Banner ── */}
                {error && (
                    <div style={{
                        marginBottom: '1.5rem', borderRadius: '16px',
                        border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.1)',
                        padding: '1rem', fontSize: '0.875rem', color: '#f87171',
                    }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
                    </div>
                )}

                {/* ── Task Input Bar ── */}
                <div style={{ marginBottom: '2rem' }}>
                    {!showForm ? (
                        <div
                            onClick={() => setShowForm(true)}
                            style={{
                                display: 'flex', alignItems: 'center',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem 1.25rem', cursor: 'text',
                                transition: 'border-color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                            <span style={{ flex: 1, fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>Take a note...</span>
                            <span style={{ color: 'rgba(255,255,255,0.25)', padding: '6px' }}>
                                <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </span>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleAddTask}
                            style={{
                                overflow: 'hidden', borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => { const v = e.target.value; setTitle(v); pushHistory(v, description); }}
                                placeholder="Title"
                                style={{
                                    width: '100%', background: 'transparent', border: 'none',
                                    padding: '1rem 1.25rem 0.25rem',
                                    fontSize: '1rem', fontWeight: 600, color: '#f0ecff',
                                    outline: 'none', boxSizing: 'border-box',
                                }}
                                autoFocus
                            />
                            <textarea
                                value={description}
                                onChange={(e) => { const v = e.target.value; setDescription(v); pushHistory(title, v); }}
                                placeholder="Take a note..."
                                rows={2}
                                style={{
                                    width: '100%', background: 'transparent', border: 'none',
                                    padding: '0.25rem 1.25rem 0.75rem',
                                    fontSize: '0.875rem', color: 'rgba(240,236,255,0.8)',
                                    outline: 'none', resize: 'none', boxSizing: 'border-box',
                                }}
                            />

                            {/* Bottom toolbar */}
                            <div style={{
                                display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                                justifyContent: 'space-between', gap: '0.75rem',
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                padding: '0.75rem 1rem',
                            }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                                    {["Low", "Medium", "High"].map((p) => {
                                        const activeStyles = {
                                            Low:    { background: 'rgba(34,197,94,0.25)',  color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)' },
                                            Medium: { background: 'rgba(245,158,11,0.25)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)' },
                                            High:   { background: 'rgba(239,68,68,0.25)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' },
                                        };
                                        const inactiveStyle = { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' };
                                        const dots = { Low: "🟢", Medium: "🟡", High: "🔴" };
                                        return (
                                            <button
                                                type="button" key={p}
                                                onClick={() => setPriority(p)}
                                                style={{
                                                    ...(priority === p ? activeStyles[p] : inactiveStyle),
                                                    borderRadius: '8px', padding: '4px 10px',
                                                    fontSize: '11px', fontWeight: 500,
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                }}
                                            >
                                                {dots[p]} {p}
                                            </button>
                                        );
                                    })}

                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        style={{
                                            borderRadius: '8px', padding: '4px 10px',
                                            fontSize: '11px', fontWeight: 500,
                                            outline: 'none', transition: 'all 0.15s',
                                            ...(dueDate
                                                ? { border: '1px solid rgba(109,95,231,0.4)', background: 'rgba(109,95,231,0.15)', color: '#a78bfa' }
                                                : { border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
                                            ),
                                        }}
                                    />

                                    {/* Undo / Redo */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '4px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '8px' }}>
                                        <button
                                            type="button" onClick={handleUndo} disabled={!canUndo} title="Undo (⌘Z)"
                                            style={{ borderRadius: '8px', padding: '6px', color: canUndo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: canUndo ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
                                        >
                                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button" onClick={handleRedo} disabled={!canRedo} title="Redo (⌘⇧Z)"
                                            style={{ borderRadius: '8px', padding: '6px', color: canRedo ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: canRedo ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
                                        >
                                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false); setTitle(""); setDescription(""); setDueDate(""); setPriority("Medium");
                                            historyRef.current = [{ title: "", description: "" }];
                                            historyIndexRef.current = 0; setCanUndo(false); setCanRedo(false);
                                        }}
                                        style={{ borderRadius: '8px', padding: '6px 16px', fontSize: '12px', fontWeight: 500, color: '#c4b5fd', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }}
                                        onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#c4b5fd'; }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={adding || !title.trim()}
                                        style={{
                                            borderRadius: '8px', padding: '6px 16px',
                                            fontSize: '12px', fontWeight: 600,
                                            color: '#fff', border: 'none', cursor: adding || !title.trim() ? 'not-allowed' : 'pointer',
                                            background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
                                            opacity: adding || !title.trim() ? 0.35 : 1,
                                            transition: 'opacity 0.15s',
                                        }}
                                    >
                                        {adding ? "Adding..." : "Add"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* ── Stats Row ── */}
                <div style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {[
                        { label: "Total",     value: tasks.length,          color: '#f0ecff', icon: "📊" },
                        { label: "Active",    value: activeTasks.length,    color: '#fbbf24', icon: "⏳" },
                        { label: "Completed", value: completedTasks.length, color: '#4ade80', icon: "✅" },
                        { label: "Overdue",   value: overdueTasks.length,   color: '#f87171', icon: "🔴" },
                    ].map((s) => (
                        <div key={s.label} style={{ ...cardStyle, padding: '1.25rem 1rem', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                            <p style={{ marginTop: '0.25rem', fontSize: '1.5rem', fontWeight: 700, color: s.color, marginBottom: 0 }}>{s.value}</p>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#c4b5fd', marginBottom: 0 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filter & Search Bar ── */}
                <div style={{ ...cardStyle, marginBottom: '1.5rem', padding: '1rem' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[
                            { key: "All",       label: "All",       count: tasks.length,          icon: "📊" },
                            { key: "Active",    label: "Active",    count: activeTasks.length,    icon: "⏳" },
                            { key: "Completed", label: "Completed", count: completedTasks.length, icon: "✅" },
                            { key: "Overdue",   label: "Overdue",   count: overdueTasks.length,   icon: "🔴" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    borderRadius: '12px', padding: '8px 16px',
                                    fontSize: '0.875rem', fontWeight: 500,
                                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                    ...(activeTab === tab.key
                                        ? { background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(109,95,231,0.3)' }
                                        : { background: 'rgba(255,255,255,0.05)', color: '#c4b5fd' }
                                    ),
                                }}
                            >
                                <span style={{ fontSize: '12px' }}>{tab.icon}</span>
                                {tab.label}
                                <span style={{
                                    marginLeft: '2px', borderRadius: '999px', padding: '2px 6px',
                                    fontSize: '10px', fontWeight: 700,
                                    background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                    color: activeTab === tab.key ? '#fff' : '#c4b5fd',
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Priority */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <svg
                                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'rgba(255,255,255,0.3)' }}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tasks..."
                                style={{ ...inputStyle, paddingLeft: '40px', paddingRight: searchQuery ? '36px' : '16px' }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '14px', transition: 'color 0.15s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
                                >✕</button>
                            )}
                        </div>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                        >
                            <option value="All"    style={{ background: '#1c1848' }}>All Priorities</option>
                            <option value="High"   style={{ background: '#1c1848' }}>🔴 High</option>
                            <option value="Medium" style={{ background: '#1c1848' }}>🟡 Medium</option>
                            <option value="Low"    style={{ background: '#1c1848' }}>🟢 Low</option>
                        </select>
                    </div>
                </div>

                {/* ── Task Cards ── */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: '#c4b5fd' }}>
                        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--c3)]" />
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.15)', padding: '4rem 1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '3rem' }}>📝</span>
                        <h3 style={{ marginTop: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', marginBottom: 0 }}>No tasks yet</h3>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#c4b5fd', marginBottom: 0 }}>
                            Click the + button above to create your first task!
                        </p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.15)', padding: '4rem 1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '3rem' }}>🔍</span>
                        <h3 style={{ marginTop: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', marginBottom: 0 }}>No matching tasks</h3>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#c4b5fd' }}>
                            Try adjusting your filters or search query
                        </p>
                        <button
                            onClick={() => { setActiveTab("All"); setSearchQuery(""); setFilterPriority("All"); }}
                            style={{ marginTop: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', padding: '8px 20px', fontSize: '0.875rem', fontWeight: 500, color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className="group"
                                style={{
                                    position: 'relative', overflow: 'hidden',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(167,139,250,0.15)',
                                    background: 'rgba(255,255,255,0.06)',
                                    backdropFilter: 'blur(20px)',
                                    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                                    opacity: task.completed ? 0.65 : 1,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.35)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                {/* Priority strip */}
                                <div style={{ height: '6px', width: '100%', ...getPriorityStripStyle(task.priority) }} />

                                <div style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => handleToggleComplete(task.id, task.completed)}
                                            title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                            style={{
                                                marginTop: '2px', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                height: '20px', width: '20px', borderRadius: '6px',
                                                border: task.completed ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.25)',
                                                background: task.completed ? 'rgba(34,197,94,0.2)' : 'transparent',
                                                color: '#4ade80', cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                        >
                                            {task.completed && (
                                                <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Title */}
                                        <h4 style={{
                                            flex: 1, fontSize: '0.875rem', fontWeight: 600,
                                            lineHeight: '1.4', color: '#f0ecff', margin: 0,
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                            opacity: task.completed ? 0.7 : 1,
                                        }}>
                                            {task.title}
                                        </h4>

                                        {/* Edit + Delete */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                            {confirmDelete === task.id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        style={{ borderRadius: '8px', background: 'rgba(239,68,68,0.2)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, color: '#f87171', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,0.3)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'rgba(239,68,68,0.2)'}
                                                    >Delete</button>
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', fontSize: '11px', fontWeight: 500, color: '#c4b5fd', border: 'none', cursor: 'pointer' }}
                                                    >No</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(task)}
                                                        title="Edit task"
                                                        className="opacity-0 group-hover:opacity-100"
                                                        style={{ borderRadius: '8px', padding: '6px', color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(109,95,231,0.15)'; e.currentTarget.style.color = '#a78bfa'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
                                                    >
                                                        <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(task.id)}
                                                        title="Delete task"
                                                        className="opacity-0 group-hover:opacity-100"
                                                        style={{ borderRadius: '8px', padding: '6px', color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
                                                    >
                                                        <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {task.description && (
                                        <p style={{
                                            marginTop: '10px', marginLeft: '32px', marginBottom: 0,
                                            fontSize: '12px', lineHeight: '1.6', color: '#c4b5fd',
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                            opacity: task.completed ? 0.6 : 1,
                                        }}>
                                            {task.description.length > 120 ? task.description.slice(0, 120) + "..." : task.description}
                                        </p>
                                    )}

                                    {/* Footer badges */}
                                    <div style={{ marginTop: '1rem', marginLeft: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: 500, ...getPriorityBadgeStyle(task.priority) }}>
                                            <span style={{ height: '6px', width: '6px', borderRadius: '50%', background: getPriorityDotColor(task.priority) }} />
                                            {task.priority}
                                        </span>

                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            borderRadius: '8px', padding: '2px 8px', fontSize: '11px',
                                            ...(isOverdue(task.dueDate) && !task.completed
                                                ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', fontWeight: 500 }
                                                : { background: 'rgba(255,255,255,0.05)', color: '#c4b5fd' }
                                            ),
                                        }}>
                                            📅 {formatDate(task.dueDate)}
                                            {isOverdue(task.dueDate) && !task.completed && " • Overdue"}
                                        </span>

                                        {task.completed && (
                                            <span style={{ borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: 500, background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                                                ✅ Done
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Edit Task Modal ── */}
                {editingTask && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(10,8,36,0.7)', backdropFilter: 'blur(4px)' }}>
                        <div style={{ position: 'absolute', inset: 0 }} onClick={closeEditModal} />
                        <form
                            onSubmit={handleUpdateTask}
                            style={{
                                position: 'relative', width: '100%', maxWidth: '32rem',
                                overflow: 'hidden', borderRadius: '20px',
                                border: '1px solid rgba(167,139,250,0.22)',
                                background: 'rgba(20,15,55,0.95)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            {/* Priority strip */}
                            <div style={{ height: '6px', width: '100%', ...getPriorityStripStyle(editPriority) }} />

                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', margin: '0 0 1.25rem' }}>Edit Task</h3>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Title <span style={{ color: '#f87171' }}>*</span></label>
                                    <input
                                        type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                                        style={inputStyle} required autoFocus
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea
                                        value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Add details..." rows={3}
                                        style={{ ...inputStyle, resize: 'none' }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: '160px' }}>
                                        <label style={labelStyle}>Due Date</label>
                                        <input
                                            type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)}
                                            style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '160px' }}>
                                        <label style={labelStyle}>Priority</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {["Low", "Medium", "High"].map((p) => {
                                                const activeStyles = {
                                                    Low:    { border: '1px solid rgba(34,197,94,0.5)',  background: 'rgba(34,197,94,0.2)',  color: '#4ade80' },
                                                    Medium: { border: '1px solid rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
                                                    High:   { border: '1px solid rgba(239,68,68,0.5)',  background: 'rgba(239,68,68,0.2)',  color: '#f87171' },
                                                };
                                                const dots = { Low: "🟢", Medium: "🟡", High: "🔴" };
                                                return (
                                                    <button
                                                        type="button" key={p} onClick={() => setEditPriority(p)}
                                                        style={{
                                                            flex: 1, borderRadius: '12px', padding: '10px 0',
                                                            fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                                                            ...(editPriority === p
                                                                ? activeStyles[p]
                                                                : { border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
                                                            ),
                                                        }}
                                                    >
                                                        {dots[p]} {p}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    <button
                                        type="button" onClick={closeEditModal}
                                        style={{ borderRadius: '12px', padding: '10px 20px', fontSize: '0.875rem', fontWeight: 500, color: '#c4b5fd', border: '1.5px solid rgba(167,139,250,0.3)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#f0ecff'; }}
                                        onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#c4b5fd'; }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating || !editTitle.trim()}
                                        style={{
                                            borderRadius: '12px', padding: '10px 24px',
                                            fontSize: '0.875rem', fontWeight: 700,
                                            color: '#fff', border: 'none',
                                            cursor: updating || !editTitle.trim() ? 'not-allowed' : 'pointer',
                                            background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
                                            boxShadow: '0 4px 16px rgba(109,95,231,0.4)',
                                            opacity: updating || !editTitle.trim() ? 0.5 : 1,
                                            transition: 'transform 0.15s, opacity 0.15s',
                                        }}
                                        onMouseEnter={(e) => { if (!updating && editTitle.trim()) e.target.style.transform = 'scale(1.02)'; }}
                                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                                    >
                                        {updating ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}
