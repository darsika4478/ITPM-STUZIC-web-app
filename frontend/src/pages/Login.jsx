<<<<<<< HEAD
<<<<<<< Updated upstream
import BaseLayout from "../layout/BaseLayout";

export default function Login() {
  return (
<<<<<<< HEAD
    <BaseLayout>
      <h1>Login</h1>
      <p style={{ color: "var(--c-accent)" }}>
        Temporary login page (Firebase will be added later).
      </p>
    </BaseLayout>
=======
export default function Login() {
  return (
=======
>>>>>>> Darshikan/feature/firebase-setup
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Login</h1>
      <p>Temporary login page (Firebase will be added later).</p>
    </div>
<<<<<<< HEAD
>>>>>>> Stashed changes
=======
>>>>>>> Darshikan/feature/firebase-setup
  );
}
=======
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AuthHeader from '../components/user-management/AuthHeader';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');

<<<<<<< HEAD
    // Forgot password modal state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);

    // If already authenticated, skip login and go straight to dashboard
=======
>>>>>>> origin/dev
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) navigate('/dashboard');
        });
        return () => unsubscribe();
    }, [navigate]);

    const validate = () => {
        const nextErrors = {};
        if (!email.trim()) nextErrors.email = 'Email is required.';
        if (!password.trim()) nextErrors.password = 'Password is required.';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');
        if (!validate()) return;
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            navigate('/dashboard');
        } catch (error) {
            setFormError('Invalid email or password.');
        }
    };

<<<<<<< HEAD
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

        setResettingPassword(true);
        setResetError('');
        setResetSuccess(false);

        try {
            let emailExists = false;

            try {
                const byLowerQuery = query(
                    collection(db, 'users'),
                    where('emailLower', '==', normalizedEmail),
                    limit(1),
                );
                const byLowerSnapshot = await getDocs(byLowerQuery);
                emailExists = !byLowerSnapshot.empty;

                if (!emailExists) {
                    const byExactQuery = query(
                        collection(db, 'users'),
                        where('email', '==', enteredEmail),
                        limit(1),
                    );
                    const byExactSnapshot = await getDocs(byExactQuery);
                    emailExists = !byExactSnapshot.empty;
                }

                if (!emailExists && enteredEmail !== normalizedEmail) {
                    const byNormalizedLegacyQuery = query(
                        collection(db, 'users'),
                        where('email', '==', normalizedEmail),
                        limit(1),
                    );
                    const byNormalizedLegacySnapshot = await getDocs(byNormalizedLegacyQuery);
                    emailExists = !byNormalizedLegacySnapshot.empty;
                }
            } catch (lookupError) {
                if (lookupError?.code !== 'permission-denied') {
                    throw lookupError;
                }

                // If read access to users collection is blocked by Firestore rules,
                // skip strict existence check and let Firebase Auth handle reset flow.
                emailExists = true;
            }

            if (!emailExists) {
                setResetError('No account found for this email address.');
                return;
            }

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
            } else if (error?.code === 'permission-denied') {
                setResetError('Unable to verify this email at the moment. Please try again.');
            } else if (error?.code === 'auth/too-many-requests') {
                setResetError('Too many attempts. Please wait and try again.');
            } else {
                setResetError('Failed to send reset email. Please try again.');
            }
        } finally {
            setResettingPassword(false);
        }
    };

    // Shared style for all text inputs
=======
>>>>>>> origin/dev
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
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-60px', left: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(109,95,231,0.28)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '-50px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(80,60,200,0.22)', filter: 'blur(70px)' }} />
                <div style={{ position: 'absolute', top: '45%', left: '35%', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(140,100,240,0.15)', filter: 'blur(60px)' }} />
            </div>

            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', top: '8%',  left: '6%',  fontSize: '1.5rem', opacity: 0.4 }}>🎧</span>
                <span style={{ position: 'absolute', top: '10%', right: '8%', fontSize: '1.5rem', opacity: 0.4 }}>🎵</span>
                <span style={{ position: 'absolute', bottom: '14%', left: '8%',  fontSize: '1.5rem', opacity: 0.4 }}>📚</span>
                <span style={{ position: 'absolute', bottom: '10%', right: '6%', fontSize: '1.5rem', opacity: 0.4 }}>☕️</span>
                <span style={{ position: 'absolute', top: '5%',  left: '42%', fontSize: '1.2rem', opacity: 0.4 }}>✍️</span>
            </div>

            <div style={{
                position: 'relative', zIndex: 10,
                width: '100%', maxWidth: '420px',
                background: 'rgba(30,24,72,0.75)',
                borderRadius: '28px', padding: '2.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(167,139,250,0.22)',
            }}>
                <AuthHeader variant="login" />

                <form style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }} onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>Email</label>
                        <input
                            id="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@stuzic.lk" style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                        />
                        {errors.email && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.email}</p>}
                    </div>

                    <div>
<<<<<<< HEAD
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
=======
                        <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>Password</label>
>>>>>>> origin/dev
                        <input
                            id="password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password" style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                        />
                        {errors.password && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.password}</p>}
                    </div>

                    {formError && <p style={{ fontSize: '0.875rem', color: '#f87171', textAlign: 'center' }}>{formError}</p>}

                    <button type="submit" style={{
                        width: '100%', padding: '12px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700,
                        color: '#fff', border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
                        boxShadow: '0 4px 20px rgba(109,95,231,0.45)',
                        transition: 'transform 0.15s, box-shadow 0.15s', marginTop: '4px',
                    }}
                        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.01)'; e.target.style.boxShadow = '0 6px 28px rgba(109,95,231,0.6)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 20px rgba(109,95,231,0.45)'; }}
                    >
                        Log In
                    </button>
                </form>

                <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#c4b5fd' }}>
                    New to STUZIC?{' '}
                    <Link to="/signup" style={{ fontWeight: 700, color: '#fff', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >Create account</Link>
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
>>>>>>> f2b9df4100d3acc8891a43b7826cb12eb215dd72
