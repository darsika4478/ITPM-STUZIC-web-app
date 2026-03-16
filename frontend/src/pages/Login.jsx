import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import AuthHeader from '../components/user-management/AuthHeader';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');

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
            {/* Ambient blobs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-60px', left: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(109,95,231,0.28)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '-50px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(80,60,200,0.22)', filter: 'blur(70px)' }} />
                <div style={{ position: 'absolute', top: '45%', left: '35%', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(140,100,240,0.15)', filter: 'blur(60px)' }} />
            </div>

            {/* Floating emojis */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', top: '8%',  left: '6%',  fontSize: '1.5rem', opacity: 0.4 }}>🎧</span>
                <span style={{ position: 'absolute', top: '10%', right: '8%', fontSize: '1.5rem', opacity: 0.4 }}>🎵</span>
                <span style={{ position: 'absolute', bottom: '14%', left: '8%',  fontSize: '1.5rem', opacity: 0.4 }}>📚</span>
                <span style={{ position: 'absolute', bottom: '10%', right: '6%', fontSize: '1.5rem', opacity: 0.4 }}>☕️</span>
                <span style={{ position: 'absolute', top: '5%',  left: '42%', fontSize: '1.2rem', opacity: 0.4 }}>✍️</span>
            </div>

            {/* Card */}
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
                        <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@stuzic.lk"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                        />
                        {errors.email && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.8)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.35)'}
                        />
                        {errors.password && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.password}</p>}
                    </div>

                    {formError && <p style={{ fontSize: '0.875rem', color: '#f87171', textAlign: 'center' }}>{formError}</p>}

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

                <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#c4b5fd' }}>
                    New to STUZIC?{' '}
                    <Link to="/signup" style={{ fontWeight: 700, color: '#fff', textDecoration: 'none' }}
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
        </main>
    );
};

export default Login;
