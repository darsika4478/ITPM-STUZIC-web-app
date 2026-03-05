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
            if (user) {
                navigate('/dashboard');
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

    return (
        <main className="relative min-h-screen overflow-hidden bg-[var(--c5)] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-[var(--c3)]/40 blur-3xl" />
                <div className="absolute top-24 -right-16 h-80 w-80 rounded-full bg-[var(--c4)]/40 blur-3xl" />
                <div className="absolute bottom-12 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--c2)]/30 blur-3xl" />
                <svg className="absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden="true">
                    <defs>
                        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
            </div>

            <div className="pointer-events-none absolute inset-0 hidden md:block">
                <div className="absolute left-10 top-16 text-2xl opacity-70">🎧</div>
                <div className="absolute right-16 top-24 text-2xl opacity-70">🎵</div>
                <div className="absolute left-16 bottom-24 text-2xl opacity-70">📚</div>
                <div className="absolute right-10 bottom-16 text-2xl opacity-70">☕️</div>
                <div className="absolute left-1/3 top-10 text-xl opacity-70">✍️</div>

                <svg className="absolute left-6 top-1/3 h-16 w-16 -rotate-6 text-[var(--c1)]/70" viewBox="0 0 24 24" fill="none">
                    <path d="M4 13V7a2 2 0 0 1 2-2h11a3 3 0 0 1 0 6H7a3 3 0 0 0-3 3Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 13v4a2 2 0 0 0 2 2h11" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <svg className="absolute right-10 top-1/3 h-14 w-14 rotate-12 text-[var(--c2)]/70" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4h9a3 3 0 0 1 3 3v12H9a3 3 0 0 0-3 3V4Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M6 4v16" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <svg className="absolute right-24 bottom-24 h-12 w-12 -rotate-12 text-[var(--c1)]/70" viewBox="0 0 24 24" fill="none">
                    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-md rounded-3xl bg-[var(--c1)]/90 p-8 text-[var(--c5)] shadow-2xl backdrop-blur">
                    <AuthHeader variant="login" />

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                className="mt-1 w-full rounded-2xl border border-[var(--c2)]/50 bg-white/80 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c3)]"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="name@stuzic.lk"
                                type="email"
                            />
                            {errors.email && <p className="mt-1 text-xs text-[var(--c4)]">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <input
                                id="password"
                                className="mt-1 w-full rounded-2xl border border-[var(--c2)]/50 bg-white/80 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c3)]"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Your password"
                                type="password"
                            />
                            {errors.password && <p className="mt-1 text-xs text-[var(--c4)]">{errors.password}</p>}
                        </div>

                        {formError && <p className="text-sm text-[var(--c4)]">{formError}</p>}

                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] py-2.5 text-white font-semibold shadow-lg transition hover:scale-[1.01] active:scale-[0.98]"
                        >
                            Log In
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-[var(--c4)]">
                        New to STUZIC?{' '}
                        <Link to="/signup" className="font-semibold text-[var(--c4)] hover:underline">
                            Create account
                        </Link>
                    </p>

                    <p className="mt-6 text-center text-xs text-[var(--c4)]/70">
                        Built for students • tasks • notes • focus
                    </p>
                </div>
            </div>
        </main>
    );
};

export default Login;
