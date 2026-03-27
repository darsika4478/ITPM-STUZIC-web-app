import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import logoIcon from '../../assets/logo-icon.png';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in as admin, redirect to admin dashboard
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    navigate('/admin/dashboard');
                }
            } catch {
                // ignore
            }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!validate()) return;

        setLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email.trim(), password);

            // Verify admin role in Firestore
            const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
            if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                await auth.signOut();
                setFormError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            navigate('/admin/dashboard');
        } catch {
            setFormError('Invalid email or password.');
        }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px',
        borderRadius: '12px', fontSize: '0.875rem',
        border: '1.5px solid rgba(248,113,113,0.25)',
        background: 'rgba(255,255,255,0.06)', color: '#f0ecff',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    return (
        <main style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #120e30 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem 1rem', position: 'relative', overflow: 'hidden',
        }}>
            {/* Background blurs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-80px', left: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(248,113,113,0.12)', filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(109,95,231,0.15)', filter: 'blur(90px)' }} />
                <div style={{ position: 'absolute', top: '40%', left: '50%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(248,113,113,0.08)', filter: 'blur(70px)' }} />
            </div>

            {/* Decorative icons */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', top: '8%', left: '6%', fontSize: '1.5rem', opacity: 0.3 }}>🛡️</span>
                <span style={{ position: 'absolute', top: '12%', right: '8%', fontSize: '1.5rem', opacity: 0.3 }}>⚙️</span>
                <span style={{ position: 'absolute', bottom: '14%', left: '10%', fontSize: '1.5rem', opacity: 0.3 }}>📊</span>
                <span style={{ position: 'absolute', bottom: '10%', right: '6%', fontSize: '1.5rem', opacity: 0.3 }}>🔐</span>
            </div>

            <div style={{
                position: 'relative', zIndex: 10,
                width: '100%', maxWidth: '420px',
                background: 'rgba(20,14,50,0.55)',
                borderRadius: '28px', padding: '2.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(248,113,113,0.15)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <img
                        src={logoIcon}
                        alt="STUZIC Logo"
                        style={{ display: 'block', height: '160px', width: 'auto', objectFit: 'contain', margin: '0 auto' }}
                    />
                    <div style={{
                        marginTop: '-20px',
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '6px 16px', borderRadius: '20px',
                        background: 'rgba(248,113,113,0.12)',
                        border: '1px solid rgba(248,113,113,0.25)',
                    }}>
                        <span style={{ fontSize: '0.75rem' }}>🛡️</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Admin Portal
                        </span>
                    </div>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#a78bfa' }}>
                        Authorized personnel only
                    </p>
                </div>

                {/* Form */}
                <form style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }} onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="admin-email" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
                            Admin Email
                        </label>
                        <input
                            id="admin-email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@stuzic.lk" style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(248,113,113,0.6)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(248,113,113,0.25)'}
                        />
                        {errors.email && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="admin-password" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
                            Password
                        </label>
                        <input
                            id="admin-password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password" style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(248,113,113,0.6)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(248,113,113,0.25)'}
                        />
                        {errors.password && <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f87171' }}>{errors.password}</p>}
                    </div>

                    {formError && (
                        <div style={{
                            padding: '10px 14px', borderRadius: '10px',
                            background: 'rgba(248,113,113,0.1)',
                            border: '1px solid rgba(248,113,113,0.2)',
                        }}>
                            <p style={{ fontSize: '0.8rem', color: '#f87171', textAlign: 'center', margin: 0 }}>{formError}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700,
                            color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                            background: loading
                                ? 'rgba(248,113,113,0.4)'
                                : 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
                            boxShadow: '0 4px 20px rgba(248,113,113,0.3)',
                            transition: 'transform 0.15s, box-shadow 0.15s', marginTop: '4px',
                            opacity: loading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => { if (!loading) { e.target.style.transform = 'scale(1.01)'; e.target.style.boxShadow = '0 6px 28px rgba(248,113,113,0.5)'; } }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 20px rgba(248,113,113,0.3)'; }}
                    >
                        {loading ? 'Verifying...' : 'Access Admin Panel'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.72rem', color: 'rgba(167,139,250,0.5)' }}>
                    STUZIC Admin Console v1.0
                </p>
            </div>
        </main>
    );
};

export default AdminLogin;
