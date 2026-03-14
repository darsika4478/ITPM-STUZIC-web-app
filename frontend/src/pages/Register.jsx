import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AuthHeader from '../components/user-management/AuthHeader';

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');

    const validate = () => {
        const nextErrors = {};
        if (!name.trim()) nextErrors.name = 'Name is required.';
        if (!email.trim()) nextErrors.email = 'Email is required.';
        if (!password.trim()) nextErrors.password = 'Password is required.';
        if (password && password.length < 6) nextErrors.password = 'Minimum 6 characters.';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');
        if (!validate()) return;

        try {
            const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await updateProfile(result.user, { displayName: name.trim() });
            await setDoc(doc(db, 'users', result.user.uid), {
                name: name.trim(),
                email: email.trim(),
                photoURL: null,
                createdAt: serverTimestamp(),
            });
            navigate('/dashboard');
        } catch (error) {
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

    return (
        <main className="relative min-h-screen overflow-hidden bg-[var(--c5)] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-28 right-10 h-72 w-72 rounded-full bg-[var(--c2)]/30 blur-3xl" />
                <div className="absolute bottom-10 -left-16 h-80 w-80 rounded-full bg-[var(--c4)]/35 blur-3xl" />
                <div className="absolute top-1/2 left-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--c3)]/35 blur-3xl" />
                <svg className="absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden="true">
                    <defs>
                        <pattern id="lines" width="28" height="28" patternUnits="userSpaceOnUse">
                            <path d="M0 28L28 0" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#lines)" />
                </svg>
            </div>

            <div className="pointer-events-none absolute inset-0 hidden md:block">
                <div className="absolute left-12 top-20 text-2xl opacity-70">📖</div>
                <div className="absolute right-20 top-20 text-2xl opacity-70">🎶</div>
                <div className="absolute left-24 bottom-24 text-2xl opacity-70">📝</div>
                <div className="absolute right-16 bottom-20 text-2xl opacity-70">⏳</div>

                <svg className="absolute left-8 top-1/2 h-16 w-16 -rotate-6 text-[var(--c1)]/70" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4h9a3 3 0 0 1 3 3v12H9a3 3 0 0 0-3 3V4Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M6 4v16" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <svg className="absolute right-8 top-1/3 h-14 w-14 rotate-12 text-[var(--c2)]/70" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M7 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M7 16h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-md rounded-3xl bg-[var(--c1)]/90 p-8 text-[var(--c5)] shadow-2xl backdrop-blur">
                    <AuthHeader variant="signup" />

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="text-sm font-medium">
                                Name
                            </label>
                            <input
                                id="name"
                                className="mt-1 w-full rounded-2xl border border-[var(--c2)]/50 bg-white/80 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c3)]"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Your name"
                            />
                            {errors.name && <p className="mt-1 text-xs text-[var(--c4)]">{errors.name}</p>}
                        </div>

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
                                placeholder="Minimum 6 characters"
                                type="password"
                            />
                            {errors.password && <p className="mt-1 text-xs text-[var(--c4)]">{errors.password}</p>}
                        </div>

                        {formError && <p className="text-sm text-[var(--c4)]">{formError}</p>}

                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] py-2.5 text-white font-semibold shadow-lg transition hover:scale-[1.01] active:scale-[0.98]"
                        >
                            Create Account
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-[var(--c4)]">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-[var(--c4)] hover:underline">
                            Log in
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

export default Register;
