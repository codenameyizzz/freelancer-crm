"use client";

import { useState } from "react";
// PERBAIKAN: Menggunakan createBrowserClient dari @supabase/ssr agar sinkron dengan middleware/callback
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Inisialisasi client khusus untuk Browser yang mendukung alur PKCE Next.js 15
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // PERBAIKAN: Arahkan secara spesifik ke rute callback yang sudah kita buat
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            alert("Gagal mengirim email: " + error.message);
        } else {
            setMessage("Cek email kamu untuk klik link login!");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Masuk ke CRM Freelance</h1>
                
                {message ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-center font-medium">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? "Sedang Mengirim..." : "Kirim Link Login"}
                        </button>
                    </form>
                )}
                
                <p className="mt-6 text-center text-xs text-gray-500">
                    Kami akan mengirimkan "Magic Link" ke email Anda untuk login tanpa password.
                </p>
            </div>
        </div>
    );
}