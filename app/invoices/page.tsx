"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        projects (
          title,
          clients (name)
        )
      `)
      .order("created_at", { ascending: false });

    if (data) setInvoices(data);
    setLoading(false);
  }

  // Fungsi untuk mengubah status invoice menjadi PAID
  async function markAsPaid(invoiceId: string) {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "Paid" })
      .eq("id", invoiceId);

    if (!error) {
      alert("Pembayaran berhasil dicatat!");
      fetchInvoices(); // Refresh data
    }
  }

  if (loading) return <div className="p-10 text-center">Memuat invoice...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Daftar Invoice</h1>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klien & Proyek</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{inv.projects?.clients?.name}</div>
                  <div className="text-xs text-gray-500">{inv.projects?.title}</div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  Rp {inv.amount.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(inv.due_date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {inv.status !== 'Paid' && (
                    <button 
                      onClick={() => markAsPaid(inv.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Tandai Lunas
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}