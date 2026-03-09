import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) navigate("/dashboard");
        });
        return () => unsubscribe();
    }, [navigate]);

    const validate = () => {
        const next = {};
        if (!email.trim()) next.email = "Email is required.";
        if (!password.trim()) next.password = "Password is required.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!validate()) return;
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            navigate("/dashboard");
        } catch {
            setFormError("Invalid email or password.");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--c5)] px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--c2)] to-[var(--c3)] bg-clip-text text-transparent">
                        STUZIC
                    </h1>
                    <p className="mt-1 text-sm text-[var(--c1)]">Study. Organize. Focus.</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--c1)]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@stuzic.lk"
                            className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--c1)]">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                    </div>

                    {formError && <p className="text-sm text-red-400">{formError}</p>}

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
                    >
                        Log In
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--c1)]">
                    New to STUZIC?{" "}
                    <Link to="/register" className="font-semibold text-[var(--c2)] hover:underline">
                        Create account
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default Login;