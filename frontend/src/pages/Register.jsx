import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");

    const validate = () => {
        const next = {};
        if (!name.trim()) next.name = "Name is required.";
        if (!email.trim()) next.email = "Email is required.";
        if (!password.trim()) next.password = "Password is required.";
        else if (password.length < 6) next.password = "Minimum 6 characters.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!validate()) return;
        try {
            const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await updateProfile(result.user, { displayName: name.trim() });
            await setDoc(doc(db, "users", result.user.uid), {
                name: name.trim(),
                email: email.trim(),
                photoURL: null,
                createdAt: serverTimestamp(),
            });
            navigate("/dashboard");
        } catch (error) {
            if (error?.code === "auth/email-already-in-use") {
                setFormError("Email already registered.");
                return;
            }
            setFormError("Unable to create account.");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--c5)] px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--c2)] to-[var(--c3)] bg-clip-text text-transparent">
                        STUZIC
                    </h1>
                    <h2 className="mt-2 text-xl font-semibold text-white">Create Account</h2>
                    <p className="mt-1 text-sm text-[var(--c1)]">Join STUZIC to manage tasks.</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--c1)]">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                    </div>

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
                            placeholder="Minimum 6 characters"
                            className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[var(--c3)] focus:ring-2 focus:ring-[var(--c3)]/20"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                    </div>

                    {formError && <p className="text-sm text-red-400">{formError}</p>}

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
                    >
                        Create Account
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--c1)]">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-[var(--c2)] hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default Register;