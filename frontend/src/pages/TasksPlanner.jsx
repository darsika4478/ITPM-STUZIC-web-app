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
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [composerMode, setComposerMode] = useState("note");
    const [checklistItems, setChecklistItems] = useState([]);
    const [checklistDraft, setChecklistDraft] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showBin, setShowBin] = useState(false);
    const [attachedImages, setAttachedImages] = useState([]);
    const [viewerImage, setViewerImage] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const imageInputRef = useRef(null);
    const editImageInputRef = useRef(null);
    const composerChecklistRefs = useRef({});
    const editChecklistRefs = useRef({});

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
    // filterPriority merged into activeTab

    // Edit task state
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editComposerMode, setEditComposerMode] = useState("note");
    const [editChecklistItems, setEditChecklistItems] = useState([]);
    const [editChecklistDraft, setEditChecklistDraft] = useState("");
    const [editDueDate, setEditDueDate] = useState("");
    const [editPriority, setEditPriority] = useState("Medium");
    const [editAttachedImages, setEditAttachedImages] = useState([]);
    const [updating, setUpdating] = useState(false);

    const createChecklistItem = useCallback((text = "", checked = false) => ({
        id: (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        checked,
    }), []);

    const normalizeChecklistItems = useCallback((items) => {
        return items
            .map((item) => ({
                ...item,
                text: (item.text || "").trim(),
            }))
            .filter((item) => item.text.length > 0);
    }, []);

    const serializeChecklistItems = useCallback((items) => {
        return normalizeChecklistItems(items)
            .map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.text}`)
            .join("\n");
    }, [normalizeChecklistItems]);

    const getTaskTitle = useCallback((task) => {
        const titleText = (task.title || "").trim();
        if (titleText) return titleText;
        const firstChecklist = getTaskChecklistItems(task).find((item) => (item.text || "").trim());
        if (firstChecklist?.text) return firstChecklist.text.trim();
        return "Untitled note";
    }, []);

    const getTaskSearchText = useCallback((task) => {
        const checklistText = getTaskChecklistItems(task).map((item) => item.text || "").join(" ");
        return [task.title, task.description, checklistText].filter(Boolean).join(" ").toLowerCase();
    }, []);

    const getTaskChecklistItems = useCallback((task) => {
        if (Array.isArray(task.checklistItems) && task.checklistItems.length > 0) {
            return task.checklistItems;
        }

        if (task.contentType !== "checklist" || !task.description) {
            return [];
        }

        return task.description
            .split(/\n+/)
            .map((line, index) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                const match = trimmed.match(/^\[(x|X| )\]\s*(.*)$/);
                if (match) {
                    return {
                        id: `legacy-${task.id}-${index}`,
                        text: match[2].trim(),
                        checked: match[1].toLowerCase() === "x",
                    };
                }
                return {
                    id: `legacy-${task.id}-${index}`,
                    text: trimmed,
                    checked: false,
                };
            })
            .filter(Boolean);
    }, []);

    const syncComposerFromNote = useCallback(() => {
        const itemsFromDescription = description
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((text) => createChecklistItem(text, false));
        setChecklistItems(itemsFromDescription.length > 0 ? itemsFromDescription : [createChecklistItem("", false)]);
        setChecklistDraft("");
    }, [createChecklistItem, description]);

    const syncNoteFromChecklist = useCallback(() => {
        const joined = normalizeChecklistItems(checklistItems).map((item) => item.text).join("\n");
        setDescription(joined);
    }, [checklistItems, normalizeChecklistItems]);

    const switchComposerMode = useCallback((nextMode) => {
        if (nextMode === composerMode) return;
        if (nextMode === "checklist") {
            syncComposerFromNote();
        } else {
            syncNoteFromChecklist();
        }
        setComposerMode(nextMode);
    }, [composerMode, syncComposerFromNote, syncNoteFromChecklist]);

    const updateChecklistItem = useCallback((itemId, updates, setState) => {
        setState((prev) => prev.map((item) => (
            item.id === itemId ? { ...item, ...updates } : item
        )));
    }, []);

    const getDateMs = useCallback((value) => {
        if (!value) return null;
        if (typeof value?.toMillis === "function") return value.toMillis();
        if (typeof value?.toDate === "function") return value.toDate().getTime();
        const parsed = new Date(value).getTime();
        return Number.isNaN(parsed) ? null : parsed;
    }, []);

    const getDaysUntilPermanentDelete = useCallback((task) => {
        const deletedAtMs = getDateMs(task.deletedAt);
        if (!deletedAtMs) return 30;
        const remaining = THIRTY_DAYS_MS - (Date.now() - deletedAtMs);
        return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
    }, [getDateMs]);

    const insertChecklistItemAfter = useCallback((itemId, setState, refsMap) => {
        const newItem = createChecklistItem("", false);
        setState((prev) => {
            const index = prev.findIndex((item) => item.id === itemId);
            if (index === -1) return [...prev, newItem];
            const next = [...prev];
            next.splice(index + 1, 0, newItem);
            return next;
        });

        requestAnimationFrame(() => {
            refsMap.current[newItem.id]?.focus();
        });
    }, [createChecklistItem]);

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

                const expiredTasks = taskList.filter((task) => {
                    if (!task.isDeleted) return false;
                    const deletedAtMs = getDateMs(task.deletedAt);
                    if (!deletedAtMs) return false;
                    return Date.now() - deletedAtMs > THIRTY_DAYS_MS;
                });

                if (expiredTasks.length > 0) {
                    Promise.all(expiredTasks.map((task) => deleteDoc(doc(db, "tasks", task.id))))
                        .catch((cleanupError) => {
                            console.error("Error cleaning expired bin tasks:", cleanupError);
                        });
                }
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
    }, [getDateMs]);

    const MAX_IMAGES_SIZE_BYTES = 1000000; // ~1MB
    const processImageFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFilesUpload = async (files, setter, currentImages) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        let totalSize = currentImages.reduce((acc, img) => acc + (typeof img === 'string' ? img.length : 0), 0);
        let newImages = [];

        for (const file of imageFiles) {
            try {
                const base64Str = await processImageFile(file);
                if (totalSize + base64Str.length > MAX_IMAGES_SIZE_BYTES) {
                    alert("Image capacity limit (~1MB) reached to save on free storage space! Cannot add more images.");
                    break;
                }
                newImages.push(base64Str);
                totalSize += base64Str.length;
            } catch (err) {
                console.error("Error processing image", err);
            }
        }

        if (newImages.length > 0) {
            setter(prev => [...prev, ...newImages]);
        }
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;
        await handleFilesUpload(files, setAttachedImages, attachedImages);
        e.target.value = null; // Reset input
    };

    const handleEditImageUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;
        await handleFilesUpload(files, setEditAttachedImages, editAttachedImages);
        e.target.value = null; // Reset input
    };

    const handleAddTask = async (e) => {
        e.preventDefault();

        const today = new Date().toISOString().split("T")[0];
        if (dueDate && dueDate < today) {
            alert("Due date cannot be in the past");
            return;
        }

        const normalizedChecklist = normalizeChecklistItems(checklistItems);
        const hasTextNote = title.trim() || description.trim();
        const hasChecklistNote = normalizedChecklist.length > 0;
        if (composerMode === "note" && !hasTextNote) return;
        if (composerMode === "checklist" && !hasChecklistNote && !title.trim()) return;
        setAdding(true);
        try {
            await addDoc(collection(db, "tasks"), {
                title: title.trim(),
                description: composerMode === "checklist"
                    ? serializeChecklistItems(normalizedChecklist) || null
                    : description.trim() || null,
                contentType: composerMode,
                checklistItems: composerMode === "checklist" ? normalizedChecklist : [],
                isDeleted: false,
                deletedAt: null,
                dueDate: dueDate || null,
                priority,
                completed: false,
                userId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
                attachedImages: attachedImages,
            });
            setTitle(""); setDescription(""); setChecklistItems([]); setChecklistDraft("");
            setComposerMode("note");
            setDueDate(""); setPriority("Medium");
            setAttachedImages([]);
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

    const handleToggleChecklistItem = async (taskId, itemId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const currentItems = getTaskChecklistItems(task);
        if (!currentItems.length) return;

        const nextItems = currentItems.map((item) => (
            (item.id === itemId)
                ? { ...item, checked: !item.checked }
                : item
        ));

        try {
            await updateDoc(doc(db, "tasks", taskId), {
                checklistItems: nextItems,
                description: serializeChecklistItems(nextItems) || null,
            });
        } catch (err) {
            console.error("Error toggling checklist item:", err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await updateDoc(doc(db, "tasks", taskId), {
                isDeleted: true,
                deletedAt: serverTimestamp(),
            });
            setConfirmDelete(null);
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const handleRestoreTask = async (taskId) => {
        try {
            await updateDoc(doc(db, "tasks", taskId), {
                isDeleted: false,
                deletedAt: null,
            });
        } catch (err) {
            console.error("Error restoring task:", err);
        }
    };

    const handlePermanentDeleteTask = async (taskId) => {
        try {
            await deleteDoc(doc(db, "tasks", taskId));
        } catch (err) {
            console.error("Error permanently deleting task:", err);
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setEditTitle(task.title || "");
        setEditDescription(task.description || "");
        setEditComposerMode(task.contentType === "checklist" || Array.isArray(task.checklistItems) ? "checklist" : "note");
        const checklistForEdit = getTaskChecklistItems(task);
        setEditChecklistItems(checklistForEdit.length > 0
            ? checklistForEdit.map((item) => ({
                id: item.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
                text: item.text || "",
                checked: !!item.checked,
            }))
            : [createChecklistItem("", false)]);
        setEditChecklistDraft("");
        setEditDueDate(task.dueDate || "");
        setEditPriority(task.priority || "Medium");
        setEditAttachedImages(task.attachedImages || (task.attachedImage ? [task.attachedImage] : []));
    };

    const closeEditModal = () => {
        setEditingTask(null);
        setEditTitle(""); setEditDescription(""); setEditChecklistItems([]); setEditChecklistDraft("");
        setEditComposerMode("note");
        setEditDueDate(""); setEditPriority("Medium");
        setEditAttachedImages([]);
        setUpdating(false);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();

        const today = new Date().toISOString().split("T")[0];
        if (editDueDate && editDueDate < today) {
            alert("Due date cannot be in the past");
            return;
        }

        if (!editTitle.trim() || !editingTask) return;
        setUpdating(true);
        try {
            const normalizedEditChecklist = normalizeChecklistItems(editChecklistItems);
            await updateDoc(doc(db, "tasks", editingTask.id), {
                title: editTitle.trim(),
                description: editComposerMode === "checklist"
                    ? serializeChecklistItems(normalizedEditChecklist) || null
                    : editDescription.trim() || null,
                contentType: editComposerMode,
                checklistItems: editComposerMode === "checklist" ? normalizedEditChecklist : [],
                dueDate: editDueDate || null,
                priority: editPriority,
                attachedImages: editAttachedImages,
            });
            closeEditModal();
        } catch (err) {
            console.error("Error updating task:", err);
            alert("Failed to update task. Please try again.");
            setUpdating(false);
        }
    };

    const addComposerChecklistItem = () => {
        const value = checklistDraft.trim();
        if (!value) return;
        setChecklistItems((prev) => [...prev, createChecklistItem(value, false)]);
        setChecklistDraft("");
    };

    const addEditChecklistItem = () => {
        const value = editChecklistDraft.trim();
        if (!value) return;
        setEditChecklistItems((prev) => [...prev, createChecklistItem(value, false)]);
        setEditChecklistDraft("");
    };

    const removeChecklistItem = (itemId, setState) => {
        setState((prev) => prev.filter((item) => item.id !== itemId));
    };

    const toggleChecklistItem = (itemId, setState) => {
        setState((prev) => prev.map((item) => (
            item.id === itemId ? { ...item, checked: !item.checked } : item
        )));
    };

    const updateChecklistItemText = (itemId, text, setState) => {
        setState((prev) => prev.map((item) => (
            item.id === itemId ? { ...item, text } : item
        )));
    };

    const getPriorityBadgeStyle = (p) => {
        switch (p) {
            case "High": return { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' };
            case "Medium": return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' };
            case "Low": return { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' };
            default: return { background: 'rgba(156,163,175,0.15)', color: '#9ca3af' };
        }
    };

    const getPriorityDotColor = (p) => {
        switch (p) {
            case "High": return '#ef4444';
            case "Medium": return '#f59e0b';
            case "Low": return '#22c55e';
            default: return '#6b7280';
        }
    };

    const getPriorityStripStyle = (p) => {
        switch (p) {
            case "High": return { background: 'linear-gradient(to right, #ef4444, #f87171)' };
            case "Medium": return { background: 'linear-gradient(to right, #f59e0b, #fbbf24)' };
            default: return { background: 'linear-gradient(to right, #22c55e, #4ade80)' };
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

    const deletedTasks = tasks
        .filter((t) => t.isDeleted)
        .sort((a, b) => (getDateMs(b.deletedAt) || 0) - (getDateMs(a.deletedAt) || 0));

    const visibleTasks = tasks.filter((t) => !t.isDeleted);

    const activeVisibleTasks = visibleTasks.filter((t) => !t.completed);
    const completedVisibleTasks = visibleTasks.filter((t) => t.completed);
    const overdueVisibleTasks = visibleTasks.filter((t) => !t.completed && isOverdue(t.dueDate));

    const filteredTasks = visibleTasks.filter((t) => {
        if (activeTab === "Active" && t.completed) return false;
        if (activeTab === "Completed" && !t.completed) return false;
        if (activeTab === "Overdue" && (t.completed || !isOverdue(t.dueDate))) return false;
        if (activeTab === "High" && t.priority !== "High") return false;
        if (activeTab === "Medium" && t.priority !== "Medium") return false;
        if (activeTab === "Low" && t.priority !== "Low") return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return getTaskSearchText(t).includes(q);
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
                            onPaste={(e) => {
                                if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
                                    handleFilesUpload(e.clipboardData.files, setAttachedImages, attachedImages);
                                }
                            }}
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

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem 0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => switchComposerMode("note")}
                                    style={{
                                        borderRadius: '999px', padding: '6px 12px',
                                        fontSize: '11px', fontWeight: 600,
                                        border: composerMode === "note" ? '1px solid rgba(167,139,250,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                        background: composerMode === "note" ? 'rgba(109,95,231,0.22)' : 'rgba(255,255,255,0.05)',
                                        color: composerMode === "note" ? '#f0ecff' : 'rgba(255,255,255,0.55)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    📝 Note
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchComposerMode("checklist")}
                                    style={{
                                        borderRadius: '999px', padding: '6px 12px',
                                        fontSize: '11px', fontWeight: 600,
                                        border: composerMode === "checklist" ? '1px solid rgba(167,139,250,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                        background: composerMode === "checklist" ? 'rgba(109,95,231,0.22)' : 'rgba(255,255,255,0.05)',
                                        color: composerMode === "checklist" ? '#f0ecff' : 'rgba(255,255,255,0.55)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ☑ Checklist
                                </button>
                            </div>

                            {composerMode === "note" ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => { const v = e.target.value; setDescription(v); pushHistory(title, v); }}
                                    placeholder="Take a note..."
                                    rows={3}
                                    style={{
                                        width: '100%', background: 'transparent', border: 'none',
                                        padding: '0.25rem 1.25rem 0.75rem',
                                        fontSize: '0.875rem', color: 'rgba(240,236,255,0.8)',
                                        outline: 'none', resize: 'none', boxSizing: 'border-box',
                                    }}
                                />
                            ) : (
                                <div style={{ padding: '0 1.25rem 0.75rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {checklistItems.map((item) => (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.35rem 0.55rem', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleChecklistItem(item.id, setChecklistItems)}
                                                    aria-label={item.checked ? 'Uncheck item' : 'Check item'}
                                                    style={{
                                                        flexShrink: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        height: '18px', width: '18px', borderRadius: '5px',
                                                        border: item.checked ? '2px solid #4ade80' : '2px solid rgba(255,255,255,0.25)',
                                                        background: item.checked ? 'rgba(34,197,94,0.2)' : 'transparent',
                                                        color: '#4ade80', cursor: 'pointer',
                                                    }}
                                                >
                                                    {item.checked && (
                                                        <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={item.text}
                                                    onChange={(e) => updateChecklistItemText(item.id, e.target.value, setChecklistItems)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            insertChecklistItemAfter(item.id, setChecklistItems, composerChecklistRefs);
                                                        }
                                                    }}
                                                    ref={(node) => {
                                                        if (node) composerChecklistRefs.current[item.id] = node;
                                                        else delete composerChecklistRefs.current[item.id];
                                                    }}
                                                    placeholder="List item"
                                                    style={{
                                                        flex: 1, background: 'transparent', border: 'none',
                                                        outline: 'none', color: '#f0ecff', fontSize: '0.875rem',
                                                        textDecoration: item.checked ? 'line-through' : 'none',
                                                        opacity: item.checked ? 0.7 : 1,
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeChecklistItem(item.id, setChecklistItems)}
                                                    style={{
                                                        flexShrink: 0, border: 'none', background: 'none',
                                                        color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        <input
                                            type="text"
                                            value={checklistDraft}
                                            onChange={(e) => setChecklistDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addComposerChecklistItem();
                                                }
                                            }}
                                            placeholder="Add list item"
                                            style={{
                                                flex: 1,
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                padding: '0.75rem 0.9rem',
                                                color: '#f0ecff',
                                                outline: 'none',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={addComposerChecklistItem}
                                            style={{
                                                borderRadius: '12px', padding: '0.75rem 1rem',
                                                border: '1px solid rgba(167,139,250,0.28)',
                                                background: 'rgba(109,95,231,0.18)',
                                                color: '#f0ecff', cursor: 'pointer',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}

                            {attachedImages.length > 0 && (
                                <div style={{ padding: '0 1rem 1rem', display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    {attachedImages.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                                            <img
                                                src={img}
                                                alt="Preview"
                                                style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'contain' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                                                title="Remove Image"
                                                style={{
                                                    position: 'absolute', top: '-8px', right: '-8px',
                                                    background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%',
                                                    width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', fontSize: '14px', lineHeight: 1
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

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
                                            Low: { background: 'rgba(34,197,94,0.25)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)' },
                                            Medium: { background: 'rgba(245,158,11,0.25)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)' },
                                            High: { background: 'rgba(239,68,68,0.25)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' },
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
                                        onChange={(e) => {
                                            const today = new Date().toISOString().split("T")[0];
                                            if (e.target.value && e.target.value < today) {
                                                alert("Due date cannot be in the past");
                                                return;
                                            }
                                            setDueDate(e.target.value);
                                        }}
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

                                        {/* Image Upload Button */}
                                        <button
                                            type="button" onClick={() => imageInputRef.current.click()} title="Attach Image"
                                            style={{ borderRadius: '8px', padding: '6px', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s', marginLeft: '4px' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                                        >
                                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            ref={imageInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false); setTitle(""); setDescription(""); setChecklistItems([]); setChecklistDraft(""); setComposerMode("note");
                                            setDueDate(""); setPriority("Medium");
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
                                        disabled={adding || (composerMode === "checklist"
                                            ? (normalizeChecklistItems(checklistItems).length === 0 && !title.trim())
                                            : (!title.trim() && !description.trim()))}
                                        style={{
                                            borderRadius: '8px', padding: '6px 16px',
                                            fontSize: '12px', fontWeight: 600,
                                            color: '#fff', border: 'none', cursor: adding ? 'not-allowed' : 'pointer',
                                            background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
                                            opacity: adding || (composerMode === "checklist"
                                                ? (normalizeChecklistItems(checklistItems).length === 0 && !title.trim())
                                                : (!title.trim() && !description.trim())) ? 0.35 : 1,
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
                        { label: "Total", value: visibleTasks.length, color: '#f0ecff', icon: "📊" },
                        { label: "Active", value: activeVisibleTasks.length, color: '#fbbf24', icon: "⏳" },
                        { label: "Completed", value: completedVisibleTasks.length, color: '#4ade80', icon: "✅" },
                        { label: "Overdue", value: overdueVisibleTasks.length, color: '#f87171', icon: "🔴" },
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                        {[
                            { key: "All", label: "All", count: visibleTasks.length, icon: "📊" },
                            { key: "Active", label: "Active", count: activeVisibleTasks.length, icon: "⏳" },
                            { key: "Completed", label: "Completed", count: completedVisibleTasks.length, icon: "✅" },
                            { key: "Overdue", label: "Overdue", count: overdueVisibleTasks.length, icon: "🔴" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(activeTab === tab.key ? 'All' : tab.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    borderRadius: '12px', padding: '8px 12px',
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

                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px', alignSelf: 'stretch' }} />

                        {[
                            { key: 'High', label: 'High', count: visibleTasks.filter(t => t.priority === 'High').length, icon: '🔴' },
                            { key: 'Medium', label: 'Medium', count: visibleTasks.filter(t => t.priority === 'Medium').length, icon: '🟡' },
                            { key: 'Low', label: 'Low', count: visibleTasks.filter(t => t.priority === 'Low').length, icon: '🟢' }
                        ].map(prio => (
                            <button
                                key={prio.key}
                                type="button"
                                onClick={() => setActiveTab(activeTab === prio.key ? 'All' : prio.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    borderRadius: '12px', padding: '8px 12px',
                                    fontSize: '0.875rem', fontWeight: 500,
                                    border: '1px solid',
                                    borderColor: activeTab === prio.key ? 'transparent' : 'rgba(167,139,250,0.15)',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    ...(activeTab === prio.key
                                        ? { background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(109,95,231,0.3)' }
                                        : { background: 'rgba(255,255,255,0.02)', color: '#c4b5fd' }
                                    ),
                                }}
                                title={activeTab === prio.key ? "Click to clear filter" : `Filter by ${prio.key} priority`}
                            >
                                <span style={{ fontSize: '12px' }}>{prio.icon}</span>
                                {prio.label}
                                <span style={{
                                    marginLeft: '2px', borderRadius: '999px', padding: '2px 6px',
                                    fontSize: '10px', fontWeight: 700,
                                    background: activeTab === prio.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                                    color: activeTab === prio.key ? '#fff' : '#a78bfa',
                                }}>
                                    {prio.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Bin */}
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
                        <button
                            type="button"
                            onClick={() => setShowBin(true)}
                            style={{
                                ...inputStyle,
                                width: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                            title="Open bin"
                        >
                            🗑️ Bin
                            {deletedTasks.length > 0 && (
                                <span style={{
                                    borderRadius: '999px',
                                    background: 'rgba(239,68,68,0.2)',
                                    color: '#f87171',
                                    fontSize: '11px',
                                    padding: '2px 7px',
                                    lineHeight: 1.2,
                                }}>
                                    {deletedTasks.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Task Cards ── */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: '#c4b5fd' }}>
                        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--c3)]" />
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading tasks...</p>
                    </div>
                ) : visibleTasks.length === 0 ? (
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
                                className="group relative"
                                style={{
                                    position: 'relative', overflow: 'hidden',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(167,139,250,0.15)',
                                    background: 'rgba(255,255,255,0.06)',
                                    backdropFilter: 'blur(20px)',
                                    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                                    opacity: task.completed ? 0.65 : 1,
                                    cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                    if (['BUTTON', 'INPUT', 'SVG', 'PATH', 'LABEL'].includes(e.target.tagName.toUpperCase())) return;
                                    setViewingTask(task);
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
                                            {getTaskTitle(task)}
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
                                                    >Move to bin</button>
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', fontSize: '11px', fontWeight: 500, color: '#c4b5fd', border: 'none', cursor: 'pointer' }}
                                                    >No</button>
                                                </div>
                                            ) : (
                                                <>
                                                    {!task.completed ? (
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
                                                    ) : (
                                                        <button
                                                            disabled
                                                            title="Unmark task to edit"
                                                            className="opacity-0 group-hover:opacity-50"
                                                            style={{ borderRadius: '8px', padding: '6px', color: 'rgba(255,255,255,0.1)', background: 'none', border: 'none', cursor: 'not-allowed', transition: 'all 0.15s' }}
                                                        >
                                                            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    )}
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
                                    {task.contentType !== 'checklist' && task.description && (
                                        <p style={{
                                            marginTop: '10px', marginLeft: '32px', marginBottom: 0,
                                            fontSize: '12px', lineHeight: '1.6', color: '#c4b5fd',
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                            opacity: task.completed ? 0.6 : 1,
                                        }}>
                                            {task.description.length > 120 ? task.description.slice(0, 120) + "..." : task.description}
                                        </p>
                                    )}

                                    {/* Checklist preview */}
                                    {task.contentType === 'checklist' && getTaskChecklistItems(task).length > 0 && (
                                        <div style={{ marginTop: '10px', marginLeft: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {getTaskChecklistItems(task).map((item) => (
                                                <label key={item.id || item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: '#f0ecff', fontSize: '0.875rem', opacity: item.checked ? 0.7 : 1, textDecoration: item.checked ? 'line-through' : 'none' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!item.checked}
                                                        onChange={() => handleToggleChecklistItem(task.id, item.id)}
                                                        style={{ accentColor: '#8b5cf6', width: '14px', height: '14px' }}
                                                    />
                                                    <span style={{ lineHeight: 1.4 }}>{item.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* Attached Image Previews */}
                                    {(task.attachedImages && task.attachedImages.length > 0) ? (
                                        <div style={{ marginTop: '12px', marginLeft: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {task.attachedImages.map((img, idx) => (
                                                <div key={idx}>
                                                    <img
                                                        src={img}
                                                        alt="Attached"
                                                        style={{
                                                            maxWidth: '120px', maxHeight: '100px', borderRadius: '8px',
                                                            border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover'
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : task.attachedImage ? (
                                        <div style={{ marginTop: '12px', marginLeft: '32px' }}>
                                            <img
                                                src={task.attachedImage}
                                                alt="Attached"
                                                style={{
                                                    maxWidth: '120px', maxHeight: '100px', borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    ) : null}

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

                {/* ── Bin Modal ── */}
                {showBin && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 55, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(10,8,36,0.72)', backdropFilter: 'blur(4px)' }}>
                        <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowBin(false)} />
                        <div style={{ position: 'relative', width: '100%', maxWidth: '44rem', maxHeight: '80vh', overflow: 'hidden', borderRadius: '20px', border: '1px solid rgba(167,139,250,0.22)', background: 'rgba(20,15,55,0.95)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.25rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f0ecff' }}>🗑️ Bin</h3>
                                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#c4b5fd' }}>Deleted tasks stay here for up to 30 days.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowBin(false)}
                                    style={{ border: 'none', background: 'none', color: '#c4b5fd', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ padding: '1rem 1.25rem', maxHeight: 'calc(80vh - 84px)', overflowY: 'auto' }}>
                                {deletedTasks.length === 0 ? (
                                    <div style={{ borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.15)', padding: '2rem 1rem', textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#f0ecff', fontWeight: 600 }}>Bin is empty</p>
                                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#c4b5fd' }}>Deleted tasks will appear here.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {deletedTasks.map((task) => (
                                            <div key={task.id} style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', padding: '0.9rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                                                    <div style={{ minWidth: 0 }}>
                                                        <p style={{ margin: 0, color: '#f0ecff', fontWeight: 600, fontSize: '0.9rem' }}>{getTaskTitle(task)}</p>
                                                        <p style={{ margin: '0.35rem 0 0', color: '#c4b5fd', fontSize: '0.75rem' }}>
                                                            {getDaysUntilPermanentDelete(task)} day{getDaysUntilPermanentDelete(task) !== 1 ? 's' : ''} left before auto-delete
                                                        </p>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRestoreTask(task.id)}
                                                            style={{ borderRadius: '10px', padding: '6px 10px', border: '1px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.12)', color: '#4ade80', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            Restore
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePermanentDeleteTask(task.id)}
                                                            style={{ borderRadius: '10px', padding: '6px 10px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            Delete now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── View Task Details Modal ── */}
                {viewingTask && !editingTask && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(10,8,36,0.85)', backdropFilter: 'blur(8px)' }}>
                        <div style={{ position: 'absolute', inset: 0 }} onClick={() => setViewingTask(null)} />
                        <div
                            style={{
                                position: 'relative', width: '100%', maxWidth: '42rem',
                                borderRadius: '24px', border: '1px solid rgba(167,139,250,0.3)',
                                background: 'rgba(20,15,55,0.95)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                                padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                                maxHeight: '85vh', overflowY: 'auto'
                            }}
                        >
                            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => {
                                        const task = viewingTask;
                                        setViewingTask(null);
                                        openEditModal(task);
                                    }}
                                    style={{
                                        background: 'rgba(109,95,231,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd', borderRadius: '8px',
                                        padding: '4px 12px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(109,95,231,0.25)'; e.currentTarget.style.color = '#f0ecff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(109,95,231,0.15)'; e.currentTarget.style.color = '#c4b5fd'; }}
                                >
                                    <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Task
                                </button>
                                <button
                                    onClick={async () => {
                                        const taskId = viewingTask.id;
                                        setViewingTask(null);
                                        await handleDeleteTask(taskId);
                                    }}
                                    style={{
                                        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '8px',
                                        padding: '4px 12px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                                >
                                    <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                                <button
                                    onClick={() => setViewingTask(null)}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >×</button>
                            </div>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0ecff', margin: 0, paddingRight: '7rem' }}>
                                {getTaskTitle(viewingTask)}
                            </h2>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, ...getPriorityBadgeStyle(viewingTask.priority) }}>
                                    <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: getPriorityDotColor(viewingTask.priority) }} />
                                    {viewingTask.priority} Priority
                                </span>
                                {(viewingTask.dueDate) && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', color: '#c4b5fd' }}>
                                        📅 Due: {formatDate(viewingTask.dueDate)}
                                    </span>
                                )}
                            </div>

                            <div style={{ marginTop: '0.5rem', width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                            {viewingTask.contentType !== 'checklist' && viewingTask.description && (
                                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#e2e8f0', margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
                                    {viewingTask.description}
                                </p>
                            )}

                            {viewingTask.contentType === 'checklist' && getTaskChecklistItems(viewingTask).length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.5rem 0' }}>
                                    {getTaskChecklistItems(viewingTask).map((item, i) => (
                                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f0ecff', fontSize: '1rem', opacity: item.checked ? 0.6 : 1, textDecoration: item.checked ? 'line-through' : 'none' }}>
                                            <input type="checkbox" checked={!!item.checked} readOnly style={{ accentColor: '#8b5cf6', width: '18px', height: '18px' }} />
                                            <span style={{ lineHeight: 1.5 }}>{item.text}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {((viewingTask.attachedImages && viewingTask.attachedImages.length > 0) || viewingTask.attachedImage) && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                                    {(viewingTask.attachedImages || [viewingTask.attachedImage]).map((img, idx) => img ? (
                                        <img
                                            key={idx} src={img} alt="Attached"
                                            onClick={() => setViewerImage(img)}
                                            style={{ maxHeight: '200px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'zoom-in' }}
                                        />
                                    ) : null)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Image Zoom Viewer Modal ── */}
                {viewerImage && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ position: 'absolute', inset: 0 }} onClick={() => setViewerImage(null)} />
                        <button
                            onClick={() => setViewerImage(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.5rem', cursor: 'pointer', zIndex: 101 }}
                        >×</button>
                        <img src={viewerImage} alt="Zoomed" style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }} />
                    </div>
                )}

                {/* ── Edit Task Modal ── */}
                {editingTask && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(10,8,36,0.7)', backdropFilter: 'blur(4px)' }}>
                        <div style={{ position: 'absolute', inset: 0 }} onClick={closeEditModal} />
                        <form
                            onSubmit={handleUpdateTask}
                            onPaste={(e) => {
                                if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
                                    handleFilesUpload(e.clipboardData.files, setEditAttachedImages, editAttachedImages);
                                }
                            }}
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setEditComposerMode("note")}
                                            style={{
                                                borderRadius: '999px', padding: '6px 12px',
                                                fontSize: '11px', fontWeight: 600,
                                                border: editComposerMode === "note" ? '1px solid rgba(167,139,250,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                                background: editComposerMode === "note" ? 'rgba(109,95,231,0.22)' : 'rgba(255,255,255,0.05)',
                                                color: editComposerMode === "note" ? '#f0ecff' : 'rgba(255,255,255,0.55)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            📝 Note
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditComposerMode("checklist")}
                                            style={{
                                                borderRadius: '999px', padding: '6px 12px',
                                                fontSize: '11px', fontWeight: 600,
                                                border: editComposerMode === "checklist" ? '1px solid rgba(167,139,250,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                                background: editComposerMode === "checklist" ? 'rgba(109,95,231,0.22)' : 'rgba(255,255,255,0.05)',
                                                color: editComposerMode === "checklist" ? '#f0ecff' : 'rgba(255,255,255,0.55)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ☑ Checklist
                                        </button>
                                    </div>

                                    {editComposerMode === "note" ? (
                                        <>
                                            <label style={labelStyle}>Description</label>
                                            <textarea
                                                value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                                                placeholder="Add details..." rows={3}
                                                style={{ ...inputStyle, resize: 'none' }}
                                                onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                                onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                                            />
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <label style={labelStyle}>Checklist items</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {editChecklistItems.map((item) => (
                                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.4rem 0.55rem', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleChecklistItem(item.id, setEditChecklistItems)}
                                                            style={{
                                                                flexShrink: 0,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                height: '18px', width: '18px', borderRadius: '5px',
                                                                border: item.checked ? '2px solid #4ade80' : '2px solid rgba(255,255,255,0.25)',
                                                                background: item.checked ? 'rgba(34,197,94,0.2)' : 'transparent',
                                                                color: '#4ade80', cursor: 'pointer',
                                                            }}
                                                        >
                                                            {item.checked && (
                                                                <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={item.text}
                                                            onChange={(e) => updateChecklistItemText(item.id, e.target.value, setEditChecklistItems)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    insertChecklistItemAfter(item.id, setEditChecklistItems, editChecklistRefs);
                                                                }
                                                            }}
                                                            ref={(node) => {
                                                                if (node) editChecklistRefs.current[item.id] = node;
                                                                else delete editChecklistRefs.current[item.id];
                                                            }}
                                                            placeholder="List item"
                                                            style={{
                                                                flex: 1, background: 'transparent', border: 'none',
                                                                outline: 'none', color: '#f0ecff', fontSize: '0.875rem',
                                                                textDecoration: item.checked ? 'line-through' : 'none',
                                                                opacity: item.checked ? 0.7 : 1,
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeChecklistItem(item.id, setEditChecklistItems)}
                                                            style={{ border: 'none', background: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={editChecklistDraft}
                                                    onChange={(e) => setEditChecklistDraft(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addEditChecklistItem();
                                                        }
                                                    }}
                                                    placeholder="Add list item"
                                                    style={{
                                                        flex: 1,
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '12px',
                                                        padding: '0.75rem 0.9rem',
                                                        color: '#f0ecff',
                                                        outline: 'none',
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addEditChecklistItem}
                                                    style={{
                                                        borderRadius: '12px', padding: '0.75rem 1rem',
                                                        border: '1px solid rgba(167,139,250,0.28)',
                                                        background: 'rgba(109,95,231,0.18)',
                                                        color: '#f0ecff', cursor: 'pointer', fontWeight: 600,
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {editAttachedImages.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                        {editAttachedImages.map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                                                <img
                                                    src={img}
                                                    alt="Preview"
                                                    style={{ maxHeight: '100px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'contain' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                                                    title="Remove Image"
                                                    style={{
                                                        position: 'absolute', top: '-8px', right: '-8px',
                                                        background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%',
                                                        width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', fontSize: '14px', lineHeight: 1
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: '160px' }}>
                                        <label style={labelStyle}>Due Date</label>
                                        <input
                                            type="date"
                                            value={editDueDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={(e) => {
                                                const today = new Date().toISOString().split("T")[0];
                                                if (e.target.value && e.target.value < today) {
                                                    alert("Due date cannot be in the past");
                                                    return;
                                                }
                                                setEditDueDate(e.target.value);
                                            }}
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
                                                    Low: { border: '1px solid rgba(34,197,94,0.5)', background: 'rgba(34,197,94,0.2)', color: '#4ade80' },
                                                    Medium: { border: '1px solid rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
                                                    High: { border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.2)', color: '#f87171' },
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

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <button
                                            type="button" onClick={() => editImageInputRef.current.click()} title="Attach Images"
                                            style={{ borderRadius: '8px', padding: '6px', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                                        >
                                            <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            ref={editImageInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleEditImageUpload}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}
