import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    deleteUser,
    EmailAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    sendEmailVerification,
    signOut,
    updatePassword,
    updateProfile,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
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

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

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

    // Password strength
    const getPasswordStrength = (pw) => {
        if (!pw) return { label: '', color: '', width: '0%' };
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
        if (score <= 2) return { label: 'Fair', color: 'bg-orange-400', width: '40%' };
        if (score <= 3) return { label: 'Good', color: 'bg-yellow-400', width: '60%' };
        if (score <= 4) return { label: 'Strong', color: 'bg-green-400', width: '80%' };
        return { label: 'Very Strong', color: 'bg-green-500', width: '100%' };
    };

    const strength = getPasswordStrength(newPassword);

    // ── Change Password ──
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!user) return;
        setPasswordSuccess(false);
        const errs = {};
        if (!currentPassword) errs.current = 'Current password is required.';
        if (!newPassword) errs.new = 'New password is required.';
        else if (newPassword.length < 6) errs.new = 'Minimum 6 characters.';
        if (newPassword !== confirmPassword) errs.confirm = 'Passwords do not match.';
        setPasswordErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setPasswordSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordErrors({});
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error) {
            console.error('Change password failed:', error);
            if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
                setPasswordErrors({ current: 'Current password is incorrect.' });
            } else if (error?.code === 'auth/too-many-requests') {
                setPasswordErrors({ current: 'Too many attempts. Try again later.' });
            } else {
                setPasswordErrors({ current: 'Failed to update password.' });
            }
        }
    };

    // ── Delete Account ──
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            setDeleteError('Type DELETE to confirm.');
            return;
        }
        if (!deletePassword) {
            setDeleteError('Password is required for verification.');
            return;
        }
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setDeleteError('No authenticated user found. Please log in again.');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        try {
            // Re-authenticate FIRST — required for deleteUser
            const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
            await reauthenticateWithCredential(currentUser, credential);

            // 1. Delete user's tasks from Firestore
            try {
                const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
                const tasksSnap = await getDocs(tasksQuery);
                const deletions = tasksSnap.docs.map((d) => deleteDoc(d.ref));
                await Promise.all(deletions);
            } catch (err) {
                console.warn('Could not delete user tasks:', err);
            }

            // 2. Delete Firestore user doc
            try {
                await deleteDoc(doc(db, 'users', currentUser.uid));
            } catch (err) {
                console.warn('Could not delete user doc:', err);
            }

            // 3. Delete the auth user — MUST be last (signs out automatically)
            await deleteUser(currentUser);
            navigate('/login');
        } catch (error) {
            console.error('Delete account failed:', error);
            if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
                setDeleteError('Password is incorrect.');
            } else if (error?.code === 'auth/requires-recent-login') {
                setDeleteError('Session expired. Please log out, log back in, and try again.');
            } else {
                setDeleteError(`Failed to delete account: ${error?.message || 'Unknown error'}.`);
            }
            setDeleting(false);
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

            {/* ── Change Password ── */}
            <div className={cardClass}>
                <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className={labelClass}>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className={inputClass}
                        />
                        {passwordErrors.current && (
                            <p className="mt-1 text-xs text-red-400">{passwordErrors.current}</p>
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className={inputClass}
                        />
                        {newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/50">Strength</span>
                                    <span className="font-medium text-white/70">{strength.label}</span>
                                </div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className={`h-full rounded-full transition-all ${strength.color}`}
                                        style={{ width: strength.width }}
                                    />
                                </div>
                            </div>
                        )}
                        {passwordErrors.new && (
                            <p className="mt-1 text-xs text-red-400">{passwordErrors.new}</p>
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className={inputClass}
                        />
                        {passwordErrors.confirm && (
                            <p className="mt-1 text-xs text-red-400">{passwordErrors.confirm}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="submit" className={btnPrimary}>
                            Update Password
                        </button>
                        {passwordSuccess && (
                            <span className="text-xs text-green-400">✓ Password changed!</span>
                        )}
                    </div>
                </form>
            </div>

            {/* ── Danger Zone ── */}
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 backdrop-blur">
                
                <p className="mb-4 text-sm text-white/50">
                    Permanently delete your account, all tasks, and profile data. This action cannot be undone.
                </p>
                <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="rounded-xl bg-red-600/80 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-red-600 active:scale-[0.98]"
                >
                    Delete My Account
                </button>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#272D3E] p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-red-400">Delete Account</h3>
                        <p className="mt-2 text-sm text-white/60">
                            This will permanently delete your account, all tasks, and uploaded data.
                            Type <span className="font-bold text-white">DELETE</span> below to confirm.
                        </p>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-white/60">Confirmation</label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder='Type "DELETE"'
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60">Current Password</label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className={inputClass}
                                />
                            </div>
                            {deleteError && (
                                <p className="text-xs text-red-400">{deleteError}</p>
                            )}
                        </div>
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                    setDeletePassword('');
                                    setDeleteError('');
                                }}
                                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-500 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting…' : 'Permanently Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
