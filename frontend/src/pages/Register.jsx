import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import AuthHeader from '../components/user-management/AuthHeader';
import { validateEmailDomain } from '../utils/emailValidation';

/**
 * Register — New user sign-up page
 *
 * Two-step flow:
 *  Step 1 (method selection): User chooses "Sign up with Google" or "Sign up with Email"
 *  Step 2 (email form):       User fills name, email, password → creates account
 */
const Register = () => {
    const navigate = useNavigate();

    // Which view to show: 'choose' (method selection) or 'email' (email form)
    const [signupMethod, setSignupMethod] = useState('choose');

    // Form field state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Field-level validation errors shown under each input
    const [errors, setErrors] = useState({});

    // Firebase or submission-level error (e.g. email already in use)
    const [formError, setFormError] = useState('');

    // Client-side validation before calling Firebase
    const validate = () => {
        const nextErrors = {};
        if (!name.trim()) nextErrors.name = 'Name is required.';
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
        } else if (password.length < 6) {
            nextErrors.password = 'Minimum 6 characters.';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0; // true = valid
    };

    const getPasswordStrength = (pass) => {
        let score = 0;
        if (!pass) return { score: 0, label: '', color: 'transparent', width: '0%' };
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score <= 2) return { score, label: 'Weak', color: '#f87171', width: '33%' };
        if (score <= 4) return { score, label: 'Fair', color: '#fbbf24', width: '66%' };
        return { score, label: 'Strong', color: '#34d399', width: '100%' };
    };

    const strength = getPasswordStrength(password);

    // Handle email form submission: create Firebase Auth account + Firestore user doc
    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');
        if (!validate()) return;

        try {
            const normalizedEmail = email.trim().toLowerCase();

            // Step 1: Create Firebase Auth account
            const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

            // Step 2: Set the display name on the auth profile
            await updateProfile(result.user, { displayName: name.trim() });

            // Step 3: Create Firestore user document for profile data
            await setDoc(doc(db, 'users', result.user.uid), {
                name: name.trim(),
                email: normalizedEmail,
                emailLower: normalizedEmail,
                photoURL: null,           // no avatar yet
                createdAt: serverTimestamp(),
            });

            navigate('/dashboard');
        } catch (error) {
            // Map common Firebase error codes to user-friendly messages
            if (error?.code === 'auth/email-already-in-use') {
                setFormError('Email already registered.');
                return;
            }
            if (error?.code === 'auth/weak-password') {
                setFormError('Password must be at least 6 characters.');
                return;
            }
            setFormError('Unable to create account.');
        }
    };

    // Handle Google Sign-Up
    const handleGoogleSignUp = async () => {
        setFormError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if this Google user already has a Firestore doc
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            // Create Firestore user doc if first-time Google user
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    name: user.displayName || '',
                    email: user.email?.toLowerCase() || '',
                    emailLower: user.email?.toLowerCase() || '',
                    photoURL: user.photoURL || null,
                    createdAt: serverTimestamp(),
                });
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Google sign-up failed:', error);
            if (error?.code === 'auth/popup-closed-by-user') {
                return; // User closed the popup — no error needed
            }
            setFormError('Google sign-up failed. Please try again.');
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

    // Shared style for method selection buttons
    const methodBtnStyle = {
        width: '100%', padding: '14px',
        borderRadius: '14px', fontSize: '0.9rem', fontWeight: 600,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem',
        transition: 'background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.15s',
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
                <div style={{ position: 'absolute', top: '-60px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(109,95,231,0.28)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '-50px', left: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(80,60,200,0.22)', filter: 'blur(70px)' }} />
                <div style={{ position: 'absolute', top: '45%', left: '35%', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(140,100,240,0.15)', filter: 'blur(60px)' }} />
            </div>

            {/* Floating emojis — decorative only */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', top: '8%', left: '6%', fontSize: '1.5rem', opacity: 0.4 }}>📖</span>
                <span style={{ position: 'absolute', top: '10%', right: '8%', fontSize: '1.5rem', opacity: 0.4 }}>🎶</span>
                <span style={{ position: 'absolute', bottom: '14%', left: '8%', fontSize: '1.5rem', opacity: 0.4 }}>📝</span>
                <span style={{ position: 'absolute', bottom: '10%', right: '6%', fontSize: '1.5rem', opacity: 0.4 }}>⏳</span>
                <span style={{ position: 'absolute', top: '5%', left: '42%', fontSize: '1.2rem', opacity: 0.4 }}>🎯</span>
            </div>

            {/* Glassmorphism register card */}
            <div style={{
                position: 'relative', zIndex: 10,
                width: '100%', maxWidth: '420px',
                background: 'rgba(30,24,72,0.75)',
                borderRadius: '28px', padding: '2.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(167,139,250,0.22)',
            }}>
                {/* Logo + "Create Account" heading */}
                <AuthHeader variant="signup" />

                {/* ─── METHOD SELECTION VIEW ─── */}
                {signupMethod === 'choose' && (
                    <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

                        {/* Email Sign-Up Button (primary) */}
                        <button
                            type="button"
                            onClick={() => { setSignupMethod('email'); setFormError(''); }}
                            style={{
                                ...methodBtnStyle,
                                color: '#fff',
                                border: 'none',
                                background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
                                boxShadow: '0 4px 20px rgba(109,95,231,0.45)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(109,95,231,0.6)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,95,231,0.45)'; }}
                        >
                            {/* Email icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M22 7l-10 7L2 7" />
                            </svg>
                            Sign up with Email
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.25rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(167,139,250,0.25)' }} />
                            <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 500 }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(167,139,250,0.25)' }} />
                        </div>

                        {/* Google Sign-Up Button (secondary) */}
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            style={{
                                ...methodBtnStyle,
                                color: '#f0ecff',
                                border: '1.5px solid rgba(167,139,250,0.3)',
                                background: 'rgba(255,255,255,0.07)',
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
                            Sign up with Google
                        </button>

                        {/* Error from Google sign-up attempt */}
                        {formError && <p style={{ fontSize: '0.875rem', color: '#f87171', textAlign: 'center', margin: 0 }}>{formError}</p>}
                    </div>
                )}

                {/* ─── EMAIL REGISTRATION FORM VIEW ─── */}
                {signupMethod === 'email' && (
                    <>
                        {/* Back button to return to method selection */}
                        <button
                            type="button"
                            onClick={() => { setSignupMethod('choose'); setFormError(''); setErrors({}); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                marginTop: '1.25rem', marginBottom: '-0.25rem',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#a78bfa', fontSize: '0.8rem', fontWeight: 500, padding: 0,
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#c4b5fd'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#a78bfa'}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" />
                                <path d="M12 19l-7-7 7-7" />
                            </svg>
                            Back to sign-up options
                        </button>

                        {/* Registration form */}
                        <form style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }} onSubmit={handleSubmit}>

                            {/* Name field */}
                            <div>
                                <label htmlFor="name" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
                                    Name
                                </label>
                                <input
                                    id="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                                />
                                {errors.name && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.name}</p>}
                            </div>

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
                                <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                                />
                                {password && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                            <span style={{ color: '#c4b5fd' }}>Password strength</span>
                                            <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                                        </div>
                                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s' }} />
                                        </div>
                                    </div>
                                )}
                                {errors.password && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.password}</p>}
                            </div>

                            {/* Firebase-level error (email taken, weak password, etc.) */}
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
                                Create Account
                            </button>
                        </form>
                    </>
                )}

                {/* Link back to login */}
                <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#c4b5fd' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ fontWeight: 700, color: '#fff', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                        Log in
                    </Link>
                </p>

                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.72rem', color: '#a78bfa' }}>
                    Built for students • tasks • notes • focus
                </p>
            </div>
        </main>
    );
};

export default Register;
