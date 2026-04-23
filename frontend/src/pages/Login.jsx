import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import AuthHeader from '../components/user-management/AuthHeader';
import { validateEmailDomain } from '../utils/emailValidation';

/**
 * Login — Email/password sign-in page
 *
 * Flow:
 *  1. If user is already logged in (onAuthStateChanged), redirect to dashboard
 *  2. User fills form → validate() checks empty fields
 *  3. handleSubmit calls Firebase signInWithEmailAndPassword
 *  4. On success → navigate to /dashboard
 *  5. On error → show "Invalid email or password"
 */
const Login = () => {
    const navigate = useNavigate();

    // Form field state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Field-level validation errors (e.g. empty email)
    const [errors, setErrors] = useState({});

    // Firebase or submission-level error message
    const [formError, setFormError] = useState('');

    // Forgot password modal state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [checkingRedirect, setCheckingRedirect] = useState(true);

    const syncGoogleUser = async (user) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName || '',
                email: user.email?.toLowerCase() || '',
                emailLower: user.email?.toLowerCase() || '',
                photoURL: user.photoURL || null,
                createdAt: serverTimestamp(),
            });
        }
    };

    // If already authenticated, skip login and go straight to dashboard
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && !checkingRedirect) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists() && userDoc.data().role === 'admin') {
                        await signOut(auth);
                        setFormError('Admin accounts cannot log in here. Please use the Admin Panel login.');
                    } else {
                        navigate('/dashboard');
                    }
                } catch (error) {
                    console.error('Failed to get user role:', error);
                }
            }
        });
        return () => unsubscribe(); // clean up listener on unmount
    }, [checkingRedirect, navigate]);

    // Complete Google sign-in if the browser falls back to a redirect flow
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (!result?.user) return;

                await syncGoogleUser(result.user);
                navigate('/dashboard');
            } catch (error) {
                if (error?.code !== 'auth/no-auth-event') {
                    console.error('Google redirect sign-in failed:', error);
                }
            } finally {
                setCheckingRedirect(false);
            }
        };

        handleRedirectResult();
    }, [navigate]);

    // Client-side validation before calling Firebase
    const validate = () => {
        const nextErrors = {};
        if (!email.trim()) {
            nextErrors.email = 'Email is required.';
        } else if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(email)) {
            nextErrors.email = 'Please enter a valid lowercase email address.';
        } else {
            const domainCheck = validateEmailDomain(email);
            if (!domainCheck.valid) {
                nextErrors.email = domainCheck.message;
            }
        }
        if (!password.trim()) {
            nextErrors.password = 'Password is required.';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0; // true = valid
    };

    // Handle form submission: sign in with Firebase Auth
    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');
        if (!validate()) return; // stop if fields are empty

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            
            // Check if user is an admin
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                await signOut(auth);
                setFormError('Admin accounts cannot log in here. Please use the Admin Panel login.');
                return;
            }

            try {
                await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
            } catch (updateErr) {
                console.error('Failed to update last login:', updateErr);
            }

            navigate('/dashboard');
        } catch (error) {
            // Generic error — don't expose whether email or password is wrong
            setFormError('Invalid email or password.');
        }
    };

    // Handle Google Sign-In
    const handleGoogleSignIn = async () => {
        setFormError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await syncGoogleUser(result.user);

            const userDocRef = doc(db, 'users', result.user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                await signOut(auth);
                setFormError('Admin accounts cannot log in here. Please use the Admin Panel login.');
                return;
            }

            try {
                await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
            } catch (updateErr) {
                console.error('Failed to update last login:', updateErr);
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Google sign-in failed:', error);
            if (error?.code === 'auth/popup-closed-by-user') {
                return; // User closed the popup — no error needed
            }

            if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/operation-not-supported-in-this-environment') {
                try {
                    await signInWithRedirect(auth, googleProvider);
                    return;
                } catch (redirectError) {
                    console.error('Google redirect sign-in failed:', redirectError);
                }
            }

            setFormError('Google sign-in failed. Please try again.');
        }
    };

    // Handle password reset email submission
    const handleResetPassword = async (e) => {
        e.preventDefault();
        const enteredEmail = resetEmail.trim();
        const normalizedEmail = enteredEmail.toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!normalizedEmail) {
            setResetError('Please enter your email address.');
            return;
        }
        if (!emailPattern.test(normalizedEmail)) {
            setResetError('Please enter a valid email address.');
            return;
        }

        // Validate email domain is real (prevent gmail.lk, hf.lk, etc.)
        const domainCheck = validateEmailDomain(normalizedEmail);
        if (!domainCheck.valid) {
            setResetError(domainCheck.message);
            return;
        }

        setResettingPassword(true);
        setResetError('');
        setResetSuccess(false);

        try {
            // Send password reset email via Firebase Auth.
            // Firebase only delivers the email if the account actually exists —
            // no email is sent for unregistered addresses.
            await sendPasswordResetEmail(auth, normalizedEmail);
            setResetSuccess(true);
            setResetEmail('');
            setTimeout(() => {
                setShowForgotModal(false);
                setResetSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Password reset failed:', error);
            if (error?.code === 'auth/invalid-email') {
                setResetError('Please enter a valid email address.');
            } else if (error?.code === 'auth/user-not-found') {
                setResetError('No account found for this email address.');
            } else if (error?.code === 'auth/too-many-requests') {
                setResetError('Too many attempts. Please wait and try again.');
            } else {
                // Show generic success even on unknown errors to avoid email enumeration
                setResetSuccess(true);
                setResetEmail('');
                setTimeout(() => {
                    setShowForgotModal(false);
                    setResetSuccess(false);
                }, 3000);
            }
        } finally {
            setResettingPassword(false);
        }
    };

    // Shared style for all text inputs
    const inputStyle = {
        width: '100%', padding: '10px 16px',
        borderRadius: '12px', fontSize: '0.875rem',
        border: '1.5px solid rgba(167,139,250,0.35)',
        background: 'rgba(255,255,255,0.07)', color: '#f0ecff',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    return (
        <main style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1c1848 0%, #231f5c 50%, #2b2570 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem 1rem', position: 'relative', overflow: 'hidden',
        }}>
            {/* Ambient purple blobs — purely decorative */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-80px', left: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(109,95,231,0.28)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(80,60,200,0.22)', filter: 'blur(70px)' }} />
                <div style={{ position: 'absolute', top: '40%', left: '30%', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(140,100,240,0.15)', filter: 'blur(60px)' }} />
            </div>

            {/* Floating emojis — decorative only */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', top: '8%', left: '6%', fontSize: '1.5rem', opacity: 0.4 }}>🎧</span>
                <span style={{ position: 'absolute', top: '12%', right: '8%', fontSize: '1.5rem', opacity: 0.4 }}>🎵</span>
                <span style={{ position: 'absolute', bottom: '14%', left: '8%', fontSize: '1.5rem', opacity: 0.4 }}>📚</span>
                <span style={{ position: 'absolute', bottom: '10%', right: '6%', fontSize: '1.5rem', opacity: 0.4 }}>☕️</span>
                <span style={{ position: 'absolute', top: '5%', left: '40%', fontSize: '1.2rem', opacity: 0.4 }}>✍️</span>
            </div>

            {/* Glassmorphism login card */}
            <div style={{
                position: 'relative', zIndex: 10,
                width: '100%', maxWidth: '420px',
                background: 'rgba(30,24,72,0.75)',
                borderRadius: '28px', padding: '2.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(167,139,250,0.22)',
            }}>
                {/* Logo + tagline */}
                <AuthHeader variant="login" />

                {/* Login form */}
                <form style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>

                    {/* Email field */}
                    <div>
                        <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            pattern="^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                            title="Please enter a valid lowercase email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            placeholder="name@stuzic.lk"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                        />
                        {errors.email && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.email}</p>}
                    </div>

                    {/* Password field */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block' }}>
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                style={{
                                    fontSize: '0.75rem',
                                    color: '#a78bfa',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    padding: 0,
                                }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Forgot password?
                            </button>
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                        />
                        {errors.password && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.password}</p>}
                    </div>

                    {/* Firebase auth error (wrong password, user not found, etc.) */}
                    {formError && <p style={{ fontSize: '0.875rem', color: '#f87171', textAlign: 'center' }}>{formError}</p>}

                    {/* Submit button */}
                    <button
                        type="submit"
                        style={{
                            width: '100%', padding: '12px',
                            borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700,
                            color: '#fff', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
                            boxShadow: '0 4px 20px rgba(109,95,231,0.45)',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            marginTop: '4px',
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.01)'; e.target.style.boxShadow = '0 6px 28px rgba(109,95,231,0.6)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 20px rgba(109,95,231,0.45)'; }}
                    >
                        Log In
                    </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(167,139,250,0.25)' }} />
                    <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 500 }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(167,139,250,0.25)' }} />
                </div>

                {/* Google Sign-In Button */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    style={{
                        width: '100%', padding: '12px',
                        borderRadius: '14px', fontSize: '0.9rem', fontWeight: 600,
                        color: '#f0ecff', border: '1.5px solid rgba(167,139,250,0.3)',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                        transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    {/* Google "G" logo */}
                    <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Link to registration page */}
                <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#c4b5fd' }}>
                    New to STUZIC?{' '}
                    <Link to="/register" style={{ fontWeight: 700, color: '#fff', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                        Create account
                    </Link>
                </p>

                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.72rem', color: '#a78bfa' }}>
                    Built for students • tasks • notes • focus
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                }}>
                    <div style={{
                        background: 'rgba(30,24,72,0.95)',
                        borderRadius: '20px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '380px',
                        border: '1px solid rgba(167,139,250,0.22)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0ecff', margin: '0 0 0.5rem' }}>
                            Reset Password
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#c4b5fd', margin: '0 0 1.5rem' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label htmlFor="reset-email" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
                                    Email Address
                                </label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="name@stuzic.lk"
                                    style={{
                                        width: '100%', padding: '10px 16px',
                                        borderRadius: '12px', fontSize: '0.875rem',
                                        border: '1.5px solid rgba(167,139,250,0.35)',
                                        background: 'rgba(255,255,255,0.07)', color: '#f0ecff',
                                        outline: 'none', boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                                    disabled={resettingPassword}
                                />
                            </div>

                            {resetError && <p style={{ fontSize: '0.875rem', color: '#f87171', margin: 0 }}>{resetError}</p>}
                            {resetSuccess && <p style={{ fontSize: '0.875rem', color: '#34d399', margin: 0 }}>✓ Check your email for the reset link!</p>}

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    disabled={resettingPassword}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: 700,
                                        color: '#fff',
                                        border: 'none',
                                        cursor: resettingPassword ? 'not-allowed' : 'pointer',
                                        background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
                                        boxShadow: '0 4px 16px rgba(109,95,231,0.4)',
                                        opacity: resettingPassword ? 0.6 : 1,
                                        transition: 'transform 0.15s, opacity 0.15s',
                                    }}
                                    onMouseEnter={(e) => !resettingPassword && (e.target.style.transform = 'scale(1.01)')}
                                    onMouseLeave={(e) => !resettingPassword && (e.target.style.transform = 'scale(1)')}
                                >
                                    {resettingPassword ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotModal(false);
                                        setResetEmail('');
                                        setResetError('');
                                        setResetSuccess(false);
                                    }}
                                    disabled={resettingPassword}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: 700,
                                        color: '#c4b5fd',
                                        border: '1.5px solid rgba(167,139,250,0.35)',
                                        background: 'rgba(255,255,255,0.07)',
                                        cursor: resettingPassword ? 'not-allowed' : 'pointer',
                                        opacity: resettingPassword ? 0.5 : 1,
                                        transition: 'border-color 0.2s, opacity 0.15s',
                                    }}
                                    onMouseEnter={(e) => !resettingPassword && (e.target.style.borderColor = 'rgba(167,139,250,0.8)')}
                                    onMouseLeave={(e) => !resettingPassword && (e.target.style.borderColor = 'rgba(167,139,250,0.35)')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Login;
