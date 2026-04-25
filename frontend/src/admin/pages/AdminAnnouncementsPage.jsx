import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const AdminAnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Broadcast form states
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) return;
        setBroadcasting(true);
        try {
            await addDoc(collection(db, 'announcements'), {
                message: broadcastMessage,
                createdAt: Timestamp.now(),
                active: true
            });
            setBroadcastMessage('');
            alert('Announcement successfully broadcasted!');
            fetchAnnouncements(); // Refresh list
        } catch(error) {
            console.error('Failed to broadcast:', error);
            alert('Failed to broadcast message.');
        }
        setBroadcasting(false);
    };

    const toggleActive = async (id, currentActive) => {
        try {
            const docRef = doc(db, 'announcements', id);
            await updateDoc(docRef, { active: !currentActive });
            setAnnouncements(prev => prev.map(ann => 
                ann.id === id ? { ...ann, active: !currentActive } : ann
            ));
        } catch (error) {
            console.error('Failed to toggle announcement status:', error);
            alert('Failed to update status.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        
        try {
            await deleteDoc(doc(db, 'announcements', id));
            setAnnouncements(prev => prev.filter(ann => ann.id !== id));
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            alert('Failed to delete announcement.');
        }
    };

    const handleEditSave = async (id) => {
        if (!editText.trim()) return;
        
        try {
            const docRef = doc(db, 'announcements', id);
            await updateDoc(docRef, { message: editText.trim() });
            setAnnouncements(prev => prev.map(ann => 
                ann.id === id ? { ...ann, message: editText.trim() } : ann
            ));
            setEditingId(null);
            setEditText('');
        } catch (error) {
            console.error('Failed to update announcement:', error);
            alert('Failed to update announcement.');
        }
    };

    return (
        <div>
            {/* Page header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ecff', margin: 0 }}>
                        Announcements
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                        Manage global platform broadcasts
                    </p>
                </div>
            </div>

            {/* Broadcast Form */}
            <div style={{
                padding: '1.5rem',
                borderRadius: '18px',
                background: 'rgba(20,14,50,0.6)',
                border: '1px solid rgba(236,72,153,0.2)',
                backdropFilter: 'blur(10px)',
                marginBottom: '2rem'
            }}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#ec4899', fontSize: '1.1rem' }}>📣 Broadcast Announcement</h3>
                <p style={{ margin: '0 0 1rem', color: '#a78bfa', fontSize: '0.85rem' }}>Send a global message to all users on the platform. Active announcements appear for 24 hours.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <textarea 
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type your announcement here..."
                        rows={2}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(236,72,153,0.3)', color: '#fff', outline: 'none', resize: 'vertical' }}
                    />
                    <button 
                        onClick={handleBroadcast}
                        disabled={broadcasting || !broadcastMessage.trim()}
                        style={{ alignSelf: 'flex-end', padding: '10px 20px', borderRadius: '10px', background: '#ec4899', color: '#fff', border: 'none', fontWeight: 'bold', cursor: broadcasting ? 'default' : 'pointer', opacity: (!broadcastMessage.trim() || broadcasting) ? 0.5 : 1 }}
                    >
                        {broadcasting ? 'Sending...' : 'Send Broadcast'}
                    </button>
                </div>
            </div>

            {/* Announcements List */}
            <div style={{
                padding: '1.5rem',
                borderRadius: '18px',
                background: 'rgba(20,14,50,0.6)',
                border: '1px solid rgba(109,95,231,0.15)',
                backdropFilter: 'blur(10px)',
            }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0ecff', margin: '0 0 1rem' }}>
                    Announcement History
                </h2>
                
                {loading ? (
                    <p style={{ color: '#a78bfa', fontSize: '0.875rem' }}>Loading announcements...</p>
                ) : announcements.length === 0 ? (
                    <p style={{ color: '#a78bfa', fontSize: '0.875rem' }}>No announcements found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {announcements.map((ann) => {
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const timeNow = new Date().getTime();
                            const isExpired = ann.createdAt ? (timeNow - ann.createdAt.toMillis() > 24 * 60 * 60 * 1000) : false;
                            
                            return (
                                <div key={ann.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(109,95,231,0.1)',
                                }}>
                                    <div style={{ flex: 1, marginRight: '1rem' }}>
                                        {editingId === ann.id ? (
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <input 
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(109,95,231,0.5)', color: '#fff', outline: 'none', marginBottom: '0.5rem' }}
                                                />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEditSave(ann.id)} style={{ padding: '4px 12px', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                                                    <button onClick={() => setEditingId(null)} style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ margin: '0 0 0.5rem', color: '#f0ecff', fontSize: '0.95rem' }}>
                                                {ann.message}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.75rem' }}>
                                            <span style={{ color: '#a78bfa' }}>
                                                {ann.createdAt?.toDate?.() 
                                                    ? ann.createdAt.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                                                    : 'Unknown Date'}
                                            </span>
                                            
                                            {isExpired && (
                                                <span style={{ 
                                                    background: 'rgba(156,163,175,0.15)', 
                                                    color: '#9ca3af',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontWeight: 600
                                                }}>
                                                    Expired
                                                </span>
                                            )}
                                            
                                            {!isExpired && ann.active && (
                                                <span style={{ 
                                                    background: 'rgba(16,185,129,0.15)', 
                                                    color: '#10b981',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontWeight: 600
                                                }}>
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => {
                                                setEditingId(ann.id);
                                                setEditText(ann.message);
                                            }}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '8px',
                                                background: 'rgba(109,95,231,0.12)',
                                                color: '#a78bfa',
                                                border: '1px solid rgba(109,95,231,0.3)',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleActive(ann.id, ann.active)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '8px',
                                                background: ann.active ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                                                color: ann.active ? '#ef4444' : '#10b981',
                                                border: `1px solid ${ann.active ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {ann.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ann.id)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '8px',
                                                background: 'rgba(248,113,113,0.12)',
                                                color: '#fca5a5',
                                                border: '1px solid rgba(248,113,113,0.35)',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncementsPage;
