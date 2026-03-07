import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    onAuthStateChanged,
    sendEmailVerification,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AvatarEditorModal from '../components/user-management/AvatarEditorModal';

const MyProfile = () => {
    const navigate = useNavigate();

    // Reactive user state — never stale
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    // Profile state
    const [name, setName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [showAvatarEditor, setShowAvatarEditor] = useState(false);

    // Email verification
    const [verificationSent, setVerificationSent] = useState(false);

    // Load profile from Firestore
    useEffect(() => {
        if (!user) return;
        const loadProfile = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.name) setName(data.name);
                    else if (user.displayName) setName(user.displayName);
                    else {
                        const prefix = user.email.split('@')[0];
                        setName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
                    }
                    if (data.photoURL) setPhotoURL(data.photoURL);
                    else if (user.photoURL) setPhotoURL(user.photoURL);
                } else {
                    setName(user.displayName || '');
                    setPhotoURL(user.photoURL || '');
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                setName(user.displayName || '');
                setPhotoURL(user.photoURL || '');
            }
        };
        loadProfile();
    }, [user]);

    // Initials helper
    const getInitials = (n) => {
        if (!n) return '??';
        const parts = n.trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : n.slice(0, 2).toUpperCase();
    };

    // ── Avatar Save (from crop modal) ── stores as Base64 in Firestore
    const handleAvatarSave = async (blob) => {
        const currentUser = auth.currentUser;
        if (!blob || !currentUser) return;
        setUploading(true);
        setProfileError('');
        setProfileSaved(false);
        try {
            // Convert blob → compressed 200×200 JPEG → base64 data-URL
            const base64 = await new Promise((resolve, reject) => {
                const img = new Image();
                const blobUrl = URL.createObjectURL(blob);
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX = 200;
                    canvas.width = MAX;
                    canvas.height = MAX;
                    canvas.getContext('2d').drawImage(img, 0, 0, MAX, MAX);
                    URL.revokeObjectURL(blobUrl);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = () => {
                    URL.revokeObjectURL(blobUrl);
                    reject(new Error('Failed to process image.'));
                };
                img.src = blobUrl;
            });

            // Safety check — Firestore docs have a 1 MB limit
            if (base64.length > 500_000) {
                throw new Error('Photo too large. Please choose a smaller image.');
            }

            await setDoc(
                doc(db, 'users', currentUser.uid),
                { photoURL: base64 },
                { merge: true },
            );
            setPhotoURL(base64);
            setShowAvatarEditor(false);
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err) {
            console.error('Avatar save failed:', err);
            setProfileError(`Upload failed: ${err?.message || 'Unknown error'}`);
            throw err; // Re-throw so the modal can catch it and clear "Saving…"
        } finally {
            setUploading(false);
        }
    };

    // ── Avatar Remove ──
    const handleRemoveAvatar = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        setUploading(true);
        setProfileError('');
        try {
            await setDoc(
                doc(db, 'users', currentUser.uid),
                { photoURL: null },
                { merge: true },
            );
            setPhotoURL('');
            setShowAvatarEditor(false);
        } catch (err) {
            console.error('Remove avatar failed:', err);
            setProfileError(`Failed to remove photo: ${err?.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    // ── Save Profile ──
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!user) return;
        setProfileSaved(false);
        setProfileError('');
        if (!name.trim()) {
            setProfileError('Name cannot be empty.');
            return;
        }
        try {
            await setDoc(doc(db, 'users', user.uid), { name: name.trim() }, { merge: true });
            await updateProfile(user, { displayName: name.trim() });
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err) {
            console.error('Save profile failed:', err);
            setProfileError('Failed to save profile.');
        }
    };

    // ── Email Verification ──
    const handleSendVerification = async () => {
        if (!user) return;
        try {
            await sendEmailVerification(user);
            setVerificationSent(true);
            setTimeout(() => setVerificationSent(false), 5000);
        } catch (err) {
            console.error('Send verification email failed:', err);
        }
    };

    // ── Logout ──
    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    // ── Metadata ──
    const createdAt = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
          })
        : '—';
    const lastLogin = user?.metadata?.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })
        : '—';

    const inputClass =
        'mt-1 w-full rounded-xl border border-[#8F8BB6]/40 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#585296]';
    const labelClass = 'block text-sm font-medium text-white/80';
    const cardClass = 'rounded-2xl border border-white/10 bg-[#3C436B]/50 p-6 backdrop-blur';
    const btnPrimary =
        'rounded-xl bg-[#585296] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#8F8BB6] active:scale-[0.98]';

    if (!user) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-white/50">Loading profile…</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 pb-10">
            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="mt-1 text-sm text-white/60">Manage your account, security, and preferences.</p>
            </div>

            {/* ── Avatar + Profile Info ── */}
            <div className={cardClass}>
                {/* Avatar — centered above heading, pen icon to edit */}
                <div className="mb-5 flex flex-col items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowAvatarEditor(true)}
                        className="group relative shrink-0"
                        aria-label="Edit profile photo"
                    >
                        {photoURL ? (
                            <img
                                src={photoURL}
                                alt="Avatar"
                                className="h-24 w-24 rounded-full object-cover ring-2 ring-[#8F8BB6]/40"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#585296] text-2xl font-bold text-white ring-2 ring-[#8F8BB6]/40">
                                {getInitials(name)}
                            </div>
                        )}
                        {/* Pen icon overlay */}
                        <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#585296] text-white shadow-lg ring-2 ring-[#272D3E] transition group-hover:bg-[#8F8BB6]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            </div>
                        )}
                    </button>
                </div>

                <h2 className="mb-5 text-center text-lg font-semibold">Profile Information</h2>

                {/* Name + Email form */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className={labelClass}>Email</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className={`${inputClass} flex-1 cursor-not-allowed opacity-60`}
                            />
                            {user && !user.emailVerified && (
                                <span className="shrink-0 rounded-lg bg-orange-500/20 px-2 py-1 text-[10px] font-semibold text-orange-300">
                                    Unverified
                                </span>
                            )}
                            {user?.emailVerified && (
                                <span className="shrink-0 rounded-lg bg-green-500/20 px-2 py-1 text-[10px] font-semibold text-green-300">
                                    Verified
                                </span>
                            )}
                        </div>
                        {user && !user.emailVerified && (
                            <button
                                type="button"
                                onClick={handleSendVerification}
                                className="mt-1.5 text-xs font-medium text-[#8F8BB6] hover:underline"
                            >
                                {verificationSent ? '✓ Verification email sent!' : 'Send verification email'}
                            </button>
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className={inputClass}
                        />
                        {profileError && (
                            <p className="mt-1 text-xs text-red-400">{profileError}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="submit" className={btnPrimary}>
                            Save Changes
                        </button>
                        {profileSaved && (
                            <span className="text-xs text-green-400">✓ Saved!</span>
                        )}
                    </div>
                </form>
            </div>

            {/* ── Account Details ── */}
            <div className={cardClass}>
                <h2 className="mb-3 text-lg font-semibold">Account Details</h2>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <p className="text-white/50">Account Created</p>
                        <p className="font-medium">{createdAt}</p>
                    </div>
                    <div>
                        <p className="text-white/50">Last Sign-In</p>
                        <p className="font-medium">{lastLogin}</p>
                    </div>
                    <div>
                        <p className="text-white/50">User ID</p>
                        <p className="font-mono text-xs text-white/60">{user?.uid}</p>
                    </div>
                    <div>
                        <p className="text-white/50">Auth Provider</p>
                        <p className="font-medium">Email / Password</p>
                    </div>
                </div>
            </div>

            {/* ── Avatar Editor Modal ── */}
            <AvatarEditorModal
                open={showAvatarEditor}
                currentPhoto={photoURL}
                onSave={handleAvatarSave}
                onDelete={handleRemoveAvatar}
                onClose={() => setShowAvatarEditor(false)}
            />
        </div>
    );
};

export default MyProfile;
