import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    deleteUser,
    EmailAuthProvider,
    GoogleAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    sendEmailVerification,
    updatePassword,
    updateProfile,
    updateEmail,
    verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AvatarEditorModal from '../components/user-management/AvatarEditorModal';

/**
 * MyProfile — User account management page
 *
 * Sections:
 *  1. Avatar — click to open crop modal, stored as Base64 in Firestore
 *  2. Profile Info — change display name, send email verification
 *  3. Account Details — read-only metadata (created date, UID, etc.)
 *  4. Change Password — requires current password re-auth before updating
 *  5. Danger Zone — permanently delete account + all Firestore data
 */
const MyProfile = () => {
    const navigate = useNavigate();

    // Keep user in sync with Firebase auth (handles token refresh, etc.)
    const [user, setUser] = useState(auth.currentUser);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    // ── Profile section state ──
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [profileSaved, setProfileSaved] = useState(false);   // success flash
    const [profileError, setProfileError] = useState('');
    const [uploading, setUploading] = useState(false);          // avatar upload in progress
    const [showAvatarEditor, setShowAvatarEditor] = useState(false);
    const [isNameEditable, setIsNameEditable] = useState(false);
    const [isEmailEditable, setIsEmailEditable] = useState(false);

    // ── Password section state ──
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // ── Delete account section state ──
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState(''); // must type "DELETE"
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    // ── Email verification state ──
    const [verificationSent, setVerificationSent] = useState(false);

    // Load name and avatar from Firestore on mount (or when user changes)
    useEffect(() => {
        if (!user) return;
        const loadProfile = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    // Prefer Firestore name → auth display name → email prefix
                    if (data.name) setName(data.name);
                    else if (user.displayName) setName(user.displayName);
                    else {
                        const prefix = user.email.split('@')[0];
                        setName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
                    }
                    // Prefer Firestore photoURL → auth photoURL
                    if (data.photoURL) setPhotoURL(data.photoURL);
                    else if (user.photoURL) setPhotoURL(user.photoURL);

                    if (user.email) setEmail(user.email);
                } else {
                    setName(user.displayName || '');
                    setPhotoURL(user.photoURL || '');
                    setEmail(user.email || '');
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                setName(user.displayName || '');
                setPhotoURL(user.photoURL || '');
                setEmail(user.email || '');
            }
        };
        loadProfile();
    }, [user]);

    // Generate initials from full name (e.g. "Thisara Sandapium" → "TS")
    const getInitials = (n) => {
        if (!n) return '??';
        const parts = n.trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : n.slice(0, 2).toUpperCase();
    };

    // ── Avatar Save ──
    // Receives cropped blob from AvatarEditorModal, converts to Base64,
    // then saves to Firestore (no Firebase Storage needed on Spark plan)
    const handleAvatarSave = async (blob) => {
        const currentUser = auth.currentUser;
        if (!blob || !currentUser) return;
        setUploading(true);
        setProfileError('');
        setProfileSaved(false);
        try {
            // Resize to 200×200 JPEG and encode as Base64 data-URL
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
                img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error('Failed to process image.')); };
                img.src = blobUrl;
            });

            // Firestore document limit is 1 MB — reject oversized images
            if (base64.length > 500_000) throw new Error('Photo too large. Please choose a smaller image.');

            await setDoc(doc(db, 'users', currentUser.uid), { photoURL: base64 }, { merge: true });
            setPhotoURL(base64);
            setShowAvatarEditor(false);
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err) {
            console.error('Avatar save failed:', err);
            setProfileError(`Upload failed: ${err?.message || 'Unknown error'}`);
            throw err; // re-throw so the modal can reset its "Saving…" state
        } finally {
            setUploading(false);
        }
    };

    // ── Avatar Remove ── clears photoURL in Firestore
    const handleRemoveAvatar = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        setUploading(true);
        setProfileError('');
        try {
            await setDoc(doc(db, 'users', currentUser.uid), { photoURL: null }, { merge: true });
            setPhotoURL('');
            setShowAvatarEditor(false);
        } catch (err) {
            console.error('Remove avatar failed:', err);
            setProfileError(`Failed to remove photo: ${err?.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    // ── Save Profile Info ── updates both Firestore and Firebase Auth
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!user) return;
        setProfileSaved(false);
        setProfileError('');
        if (!name.trim()) { setProfileError('Name cannot be empty.'); return; }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setProfileError('Valid email is required.'); return; }
        
        try {
            await setDoc(doc(db, 'users', user.uid), { name: name.trim() }, { merge: true });
            await updateProfile(user, { displayName: name.trim() });
            
            if (email.trim() !== user.email) {
                if (typeof verifyBeforeUpdateEmail === 'function') {
                    await verifyBeforeUpdateEmail(user, email.trim());
                    setProfileError('Verification link sent to new email. Please verify to complete the change.');
                } else {
                    await updateEmail(user, email.trim());
                }
                await setDoc(doc(db, 'users', user.uid), { emailLower: email.trim().toLowerCase(), email: email.trim() }, { merge: true });
            }
            
            setIsNameEditable(false);
            setIsEmailEditable(false);
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err) {
            console.error('Save profile failed:', err);
            if (err.code === 'auth/requires-recent-login') {
                setProfileError('Security restriction: Please re-authenticate (log out and log back in) to update your email.');
            } else {
                setProfileError(err.message || 'Failed to save profile.');
            }
        }
    };

    // ── Email Verification ── sends a verification email via Firebase Auth
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

    // Returns strength label and bar color/width based on password complexity
    const getPasswordStrength = (pw) => {
        if (!pw) return { label: '', color: 'transparent', width: '0%' };
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '20%' };
        if (score <= 2) return { label: 'Fair', color: '#f97316', width: '40%' };
        if (score <= 3) return { label: 'Good', color: '#eab308', width: '60%' };
        if (score <= 4) return { label: 'Strong', color: '#4ade80', width: '80%' };
        return { label: 'Very Strong', color: '#22c55e', width: '100%' };
    };
    const strength = getPasswordStrength(newPassword);

    // ── Change Password ──
    // Re-authenticates with current password first (Firebase requires this),
    // then calls updatePassword with the new password
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
            await reauthenticateWithCredential(user, credential); // verify current password
            await updatePassword(user, newPassword);
            setPasswordSuccess(true);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
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
    // Order matters: re-auth → delete tasks → delete user doc → delete auth user
    // deleteUser() must be last — it signs the user out automatically
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') { setDeleteError('Type DELETE to confirm.'); return; }
        const currentUser = auth.currentUser;
        if (!currentUser) { setDeleteError('No authenticated user found. Please log in again.'); return; }
        const providerIds = currentUser.providerData?.map((provider) => provider.providerId) || [];
        const isGoogleOnlyUser = providerIds.includes('google.com') && !providerIds.includes('password');
        if (!isGoogleOnlyUser && !deletePassword) { setDeleteError('Password is required for verification.'); return; }

        setDeleting(true);
        setDeleteError('');
        try {
            // Re-authenticate before destructive operation
            if (isGoogleOnlyUser) {
                const googleProvider = new GoogleAuthProvider();
                await reauthenticateWithPopup(currentUser, googleProvider);
            } else {
                const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
                await reauthenticateWithCredential(currentUser, credential);
            }

            // Delete all tasks belonging to this user
            try {
                const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
                const tasksSnap = await getDocs(tasksQuery);
                await Promise.all(tasksSnap.docs.map((d) => deleteDoc(d.ref)));
            } catch (err) { console.warn('Could not delete user tasks:', err); }

            // Delete the Firestore user document
            try {
                await deleteDoc(doc(db, 'users', currentUser.uid));
            } catch (err) { console.warn('Could not delete user doc:', err); }

            // Finally, delete the Firebase Auth account (signs out automatically)
            await deleteUser(currentUser);
            navigate('/login');
        } catch (error) {
            console.error('Delete account failed:', error);
            if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
                setDeleteError('Password is incorrect.');
            } else if (error?.code === 'auth/popup-closed-by-user') {
                setDeleteError('Google re-authentication was canceled. Please try again.');
            } else if (error?.code === 'auth/popup-blocked') {
                setDeleteError('Popup was blocked by your browser. Please allow popups and try again.');
            } else if (error?.code === 'auth/requires-recent-login') {
                setDeleteError('Session expired. Please log out, log back in, and try again.');
            } else {
                setDeleteError(`Failed to delete account: ${error?.message || 'Unknown error'}.`);
            }
            setDeleting(false);
        }
    };

    // Format Firebase metadata timestamps to readable strings
    const createdAt = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
    const lastLogin = user?.metadata?.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';
    const providerIds = user?.providerData?.map((provider) => provider.providerId) || [];
    const isGoogleOnlyUser = providerIds.includes('google.com') && !providerIds.includes('password');

    // ── Shared style objects ──
    const inputStyle = {
        width: '100%', padding: '10px 16px', borderRadius: '12px', fontSize: '0.875rem',
        border: '1.5px solid rgba(167,139,250,0.35)',
        background: 'rgba(255,255,255,0.07)', color: '#f0ecff',
        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', marginTop: '5px',
    };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd' };
    const cardStyle = {
        background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '1px solid rgba(167,139,250,0.15)',
        backdropFilter: 'blur(20px)',
    };
    const btnPrimaryStyle = {
        padding: '10px 22px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700,
        color: '#fff', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
        boxShadow: '0 4px 16px rgba(109,95,231,0.4)', transition: 'transform 0.15s',
    };

    // Show placeholder while Firebase resolves the user
    if (!user) {
        return (
            <div style={{ display: 'flex', height: '16rem', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: '#a78bfa' }}>Loading profile…</p>
            </div>
        );
    }

    return (
        // Negative margin trick: extends background to fill the full content area
        // (overrides the 2rem padding applied by DashboardLayout)
        <div style={{
            margin: '-2rem', padding: '2rem', minHeight: '100vh',
            background: 'linear-gradient(135deg, #1c1848 0%, #231f5c 50%, #2b2570 100%)',
        }}>
            <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>

                

                {/* ── Avatar + Profile Info card ── */}
                <div style={cardStyle}>
                    {/* Avatar with edit button overlay — opens crop modal */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <button
                            type="button"
                            onClick={() => setShowAvatarEditor(true)}
                            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            aria-label="Edit profile photo"
                        >
                            {/* Show photo if available, otherwise show initials */}
                            {photoURL ? (
                                <img src={photoURL} alt="Avatar" style={{ height: '96px', width: '96px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 3px rgba(167,139,250,0.4)' }} />
                            ) : (
                                <div style={{ display: 'flex', height: '96px', width: '96px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', fontSize: '1.5rem', fontWeight: 700, color: '#fff', boxShadow: '0 0 0 3px rgba(167,139,250,0.4)' }}>
                                    {getInitials(name)}
                                </div>
                            )}
                            {/* Pencil icon badge */}
                            <div style={{ position: 'absolute', bottom: 0, right: 0, display: 'flex', height: '2rem', width: '2rem', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#6d5fe7', color: '#fff', boxShadow: '0 2px 8px rgba(109,95,231,0.5)', border: '2px solid #1c1848' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.875rem', width: '0.875rem' }} viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </div>
                            {/* Upload spinner overlay */}
                            {uploading && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(0,0,0,0.5)' }}>
                                    <div style={{ height: '1.25rem', width: '1.25rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
                                </div>
                            )}
                        </button>
                    </div>

                    <h2 style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', margin: '0 0 1.25rem' }}>Profile Information</h2>

                    {/* Name and email form */}
                    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Editable display name */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{...labelStyle, marginBottom: 0}}>Name</label>
                                <button type="button" onClick={() => setIsNameEditable(!isNameEditable)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 6px 0', color: '#a78bfa' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.875rem', width: '0.875rem' }} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>
                            <input type="text" value={name} disabled={!isNameEditable} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{...inputStyle, opacity: isNameEditable ? 1 : 0.6, cursor: isNameEditable ? 'text' : 'not-allowed' }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'} />
                            {profileError && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{profileError}</p>}
                        </div>

                        {/* Email — editable with toggle */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{...labelStyle, marginBottom: 0}}>Email</label>
                                <button type="button" onClick={() => setIsEmailEditable(!isEmailEditable)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 6px 0', color: '#a78bfa' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.875rem', width: '0.875rem' }} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="email" value={email} disabled={!isEmailEditable} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, flex: 1, opacity: isEmailEditable ? 1 : 0.6, cursor: isEmailEditable ? 'text' : 'not-allowed' }} 
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'} />
                                {user && !user.emailVerified && (
                                    <span style={{ flexShrink: 0, borderRadius: '8px', background: 'rgba(251,146,60,0.18)', padding: '3px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#fb923c' }}>Unverified</span>
                                )}
                                {user?.emailVerified && (
                                    <span style={{ flexShrink: 0, borderRadius: '8px', background: 'rgba(52,211,153,0.18)', padding: '3px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#34d399' }}>Verified</span>
                                )}
                            </div>
                            {/* Show verification link only if email not yet verified */}
                            {user && !user.emailVerified && (
                                <button type="button" onClick={handleSendVerification} style={{ marginTop: '6px', fontSize: '0.75rem', fontWeight: 500, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {verificationSent ? '✓ Verification email sent!' : 'Send verification email'}
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button type="submit" style={btnPrimaryStyle}>Save Changes</button>
                            {profileSaved && <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>✓ Saved!</span>}
                        </div>
                    </form>
                </div>

                {/* ── Account Details card — read-only metadata from Firebase Auth ── */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', margin: '0 0 0.75rem' }}>Account Details</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <div>
                            <p style={{ color: '#c4b5fd', marginBottom: '2px', marginTop: 0 }}>Account Created</p>
                            <p style={{ fontWeight: 600, color: '#f0ecff', margin: 0 }}>{createdAt}</p>
                        </div>
                        <div>
                            <p style={{ color: '#c4b5fd', marginBottom: '2px', marginTop: 0 }}>Last Sign-In</p>
                            <p style={{ fontWeight: 600, color: '#f0ecff', margin: 0 }}>{lastLogin}</p>
                        </div>
                    </div>
                </div>

                {/* ── Change Password card ── */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', margin: '0 0 1rem' }}>Change Password</h2>
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Current password — used for re-authentication */}
                        <div>
                            <label style={labelStyle}>Current Password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'} />
                            {passwordErrors.current && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{passwordErrors.current}</p>}
                        </div>

                        {/* New password with live strength indicator */}
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'} />
                            {newPassword && (
                                <div style={{ marginTop: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                        <span style={{ color: '#c4b5fd' }}>Strength</span>
                                        <span style={{ fontWeight: 600, color: '#c4b5fd' }}>{strength.label}</span>
                                    </div>
                                    {/* Bar width and color are dynamic — kept as inline style */}
                                    <div style={{ height: '6px', width: '100%', overflow: 'hidden', borderRadius: '999px', background: 'rgba(255,255,255,0.1)' }}>
                                        <div style={{ height: '100%', borderRadius: '999px', background: strength.color, width: strength.width, transition: 'width 0.3s' }} />
                                    </div>
                                </div>
                            )}
                            {passwordErrors.new && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{passwordErrors.new}</p>}
                        </div>

                        <div>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'} />
                            {passwordErrors.confirm && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{passwordErrors.confirm}</p>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button type="submit" style={btnPrimaryStyle}>Update Password</button>
                            {passwordSuccess && <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>✓ Password changed!</span>}
                        </div>
                    </form>
                </div>

                {/* ── Danger Zone — irreversible account deletion ── */}
                <div style={{ borderRadius: '20px', border: '1.5px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.06)', padding: '1.75rem', backdropFilter: 'blur(20px)' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f87171', margin: '0 0 0.5rem' }}>Danger Zone</h2>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'rgba(248,113,113,0.8)' }}>
                        Permanently delete your account, all tasks, and profile data. This action cannot be undone.
                    </p>
                    {isGoogleOnlyUser && (
                        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#c4b5fd' }}>
                            Since this is a Google account, you will be asked to re-authenticate with Google before deletion.
                        </p>
                    )}
                    <button type="button" onClick={() => setShowDeleteModal(true)} style={{ padding: '10px 22px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', boxShadow: '0 4px 16px rgba(220,38,38,0.4)' }}>
                        Delete My Account
                    </button>
                </div>

                {/* ── Delete Confirmation Modal ── */}
                {showDeleteModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,8,36,0.7)', padding: '1rem', backdropFilter: 'blur(4px)' }}>
                        <div style={{ width: '100%', maxWidth: '28rem', borderRadius: '20px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(20,15,55,0.95)', padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f87171', margin: 0 }}>Delete Account</h3>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#c4b5fd' }}>
                                This will permanently delete your account, all tasks, and uploaded data.
                                Type <strong style={{ color: '#f0ecff' }}>DELETE</strong> below to confirm.
                                {isGoogleOnlyUser
                                    ? ' Then continue with Google verification.'
                                    : ' Then enter your current password.'}
                            </p>
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* Must type "DELETE" exactly to enable the confirm button */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#c4b5fd' }}>Confirmation</label>
                                    <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder='Type "DELETE"' style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'} />
                                </div>
                                {!isGoogleOnlyUser && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#c4b5fd' }}>Current Password</label>
                                        <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter your password" style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'} />
                                    </div>
                                )}
                                {deleteError && <p style={{ fontSize: '0.75rem', color: '#f87171', margin: 0 }}>{deleteError}</p>}
                            </div>
                            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                {/* Cancel — resets all delete modal state */}
                                <button type="button" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeletePassword(''); setDeleteError(''); }}
                                    style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, color: '#c4b5fd', border: '1.5px solid rgba(167,139,250,0.3)', background: 'transparent', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="button" onClick={handleDeleteAccount} disabled={deleting}
                                    style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', boxShadow: '0 4px 16px rgba(220,38,38,0.3)', opacity: deleting ? 0.6 : 1 }}>
                                    {deleting ? 'Deleting…' : 'Permanently Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Avatar crop modal — manages its own open/close state via props */}
                <AvatarEditorModal
                    open={showAvatarEditor}
                    currentPhoto={photoURL}
                    onSave={handleAvatarSave}
                    onDelete={handleRemoveAvatar}
                    onClose={() => setShowAvatarEditor(false)}
                />
            </div>
        </div>
    );
};

export default MyProfile;
