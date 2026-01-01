"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewInvoicePage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const { projectId } = use(params);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    async function fetchProjectDetail() {
      const { data } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .eq("id", projectId)
        .single();
      if (data) {
        setProject(data);
        // Default jatuh tempo 7 hari dari sekarang
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setDueDate(date.toISOString().split('T')[0]);
      }
    }
    fetchProjectDetail();
  }, [projectId]);

  const handleCreateInvoice = async () => {
    setLoading(true);
    const { error } = await supabase.from("invoices").insert([
      {
        project_id: projectId,
        amount: project.budget,
        due_date: dueDate,
        status: "Unpaid"
      }
    ]);

    if (!error) {
      alert("Invoice berhasil dibuat!");
      router.push("/projects");
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  if (!project) return <p className="p-10 text-center">Memuat data proyek...</p>;

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Buat Invoice Tagihan</h1>
      <div className="bg-gray-50 p-6 rounded-lg border mb-6">
        <p className="text-sm text-gray-500">Menagih untuk proyek:</p>
        <h2 className="text-lg font-bold">{project.title}</h2>
        <p className="text-sm font-medium">Klien: {project.clients.name}</p>
        <p className="mt-4 text-xl font-bold text-blue-600">
          Total Tagihan: Rp {project.budget.toLocaleString('id-ID')}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Tanggal Jatuh Tempo</label>
        <input 
          type="date" 
          className="w-full border p-2 rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <button
        onClick={handleCreateInvoice}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "Memproses..." : "Konfirmasi & Kirim Tagihan"}
      </button>
    </div>
  );
}