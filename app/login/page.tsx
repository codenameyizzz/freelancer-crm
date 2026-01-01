"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            flowType: 'pkce',
        }
    }
);

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // 2. PERBAIKAN: Arahkan ke /auth/callback, bukan origin saja
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            alert(error.message);
        } else {
            setMessage("Cek email kamu untuk klik link login!");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border">
                <h1 className="text-2xl font-bold mb-6 text-center">Masuk ke CRM Freelance</h1>
                {message ? (
                    <p className="text-green-600 text-center font-medium">{message}</p>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Alamat Email</label>
                            <input
                                type="email"
                                required
                                className="w-full border p-2 rounded"
                                placeholder="yizreel@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading ? "Mengirim..." : "Kirim Link Login"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}