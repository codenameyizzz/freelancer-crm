"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("clients").insert([
      { name, email }
    ]);

    setLoading(false);

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert("Klien berhasil ditambahkan!");
      router.push("/projects/new"); // Setelah tambah klien, langsung arahkan ke buat proyek
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Tambah Klien Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg">
        <div>
          <label className="block text-sm font-medium">Nama Klien / Perusahaan</label>
          <input
            required
            type="text"
            className="mt-1 block w-full border p-2 rounded"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email Klien</label>
          <input
            required
            type="email"
            className="mt-1 block w-full border p-2 rounded"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Menyimpan..." : "Simpan Klien"}
        </button>
      </form>
    </div>
  );
}