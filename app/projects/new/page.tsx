"use client";

import { useState, useEffect } from "react";
// Ganti import ini
import { createBrowserClient } from "@supabase/ssr"; 
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);

    // Gunakan createBrowserClient agar sinkron dengan Login & Middleware
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // State untuk form
    const [formData, setFormData] = useState({
        title: "",
        client_id: "",
        deadline: "",
        budget: "",
        description: "",
    });

    // 1. Ambil daftar klien saat halaman dimuat untuk isi Dropdown
    useEffect(() => {
        async function fetchClients() {
            const { data, error } = await supabase.from("clients").select("id, name");
            if (data) setClients(data);
            if (error) console.error("Error fetching clients:", error);
        }
        fetchClients();
    }, []);

    // 2. Fungsi Kirim Data
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Ambil user yang sedang login
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from("projects").insert([
            {
                title: formData.title,
                client_id: formData.client_id,
                deadline: formData.deadline,
                budget: parseFloat(formData.budget),
                description: formData.description,
                status: "In Progress",
                // Pastikan tabel projects juga punya kolom user_id jika kamu ingin menguncinya di RLS
            },
        ]);

        setLoading(false);

        if (error) {
            alert("Gagal menambah proyek: " + error.message);
        } else {
            alert("Proyek berhasil ditambahkan!");
            router.push("/projects"); // Pindah ke halaman daftar proyek
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Buat Proyek Baru</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg">
                {/* Judul Proyek */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Proyek</label>
                    <input
                        required
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="Contoh: Desain Landing Page"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* Pilih Klien */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pilih Klien</label>
                    <select
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    >
                        <option value="">-- Pilih Klien --</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">*Pastikan sudah ada data di tabel klien</p>
                </div>

                {/* Deadline */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <input
                        required
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                </div>

                {/* Budget */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Budget (IDR)</label>
                    <input
                        required
                        type="number"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="5000000"
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                </div>

                {/* Deskripsi */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi Singkat</label>
                    <textarea
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        rows={3}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Tombol Simpan */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Menyimpan..." : "Simpan Proyek"}
                </button>
            </form>
        </div>
    );
}