"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr"; // Gunakan browser client agar sinkron
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Ambil data user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Sesi berakhir, silakan login kembali.");
      router.push("/login");
      return;
    }

    // 2. Masukkan user_id ke dalam data yang akan di-insert
    const { error } = await supabase.from("clients").insert([
      { 
        name, 
        email, 
        user_id: user.id // <--- WAJIB disertakan agar lolos RLS
      }
    ]);

    setLoading(false);

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert("Klien berhasil ditambahkan!");
      router.push("/projects/new");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tambah Klien Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow-md rounded-xl border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Klien / Perusahaan</label>
          <input
            required
            type="text"
            placeholder="PT. Maju Bersama"
            className="mt-1 block w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 outline-none"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Klien</label>
          <input
            required
            type="email"
            placeholder="klien@email.com"
            className="mt-1 block w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Menyimpan..." : "Simpan Klien"}
        </button>
      </form>
    </div>
  );
}