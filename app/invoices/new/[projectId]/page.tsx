"use client";

import { useState, useEffect, use } from "react";
// PERBAIKAN: Gunakan createBrowserClient agar session login terbaca saat join tabel
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function NewInvoicePage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const { projectId } = use(params);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [dueDate, setDueDate] = useState("");

  // Inisialisasi client khusus browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchProjectDetail() {
      // PERBAIKAN: Pastikan penulisan query join clients menggunakan kurung biasa
      // dan pastikan foreign key client_id di tabel projects sudah benar
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Gagal mengambil detail proyek:", error.message);
        return;
      }

      if (data) {
        setProject(data);
        // Default jatuh tempo 7 hari dari sekarang
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setDueDate(date.toISOString().split('T')[0]);
      }
    }
    fetchProjectDetail();
  }, [projectId, supabase]);

  const handleCreateInvoice = async () => {
    if (!project) return;
    
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
      router.push("/invoices"); // Diarahkan ke daftar invoice
    } else {
      alert("Gagal membuat invoice: " + error.message);
    }
    setLoading(false);
  };

  if (!project) return <p className="p-10 text-center text-gray-500">Memuat data proyek...</p>;

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Buat Invoice Tagihan</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
        <p className="text-sm text-gray-500">Menagih untuk proyek:</p>
        <h2 className="text-lg font-bold text-gray-900">{project.title}</h2>
        
        {/* PERBAIKAN: Tambahkan Optional Chaining (?.) untuk menghindari crash jika data klien kosong */}
        <p className="text-sm font-medium text-gray-700">
          Klien: {project.clients?.name || "Klien tidak ditemukan"}
        </p>
        
        <p className="mt-4 text-xl font-bold text-blue-600">
          Total Tagihan: Rp {project.budget?.toLocaleString('id-ID')}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal Jatuh Tempo</label>
        <input 
          type="date" 
          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <button
        onClick={handleCreateInvoice}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-colors shadow-md"
      >
        {loading ? "Memproses..." : "Konfirmasi & Kirim Tagihan"}
      </button>
      
      <button 
        onClick={() => router.back()}
        className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
      >
        Batalkan
      </button>
    </div>
  );
}