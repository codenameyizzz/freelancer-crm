"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*, projects(title, clients(name))")
      .order("created_at", { ascending: false });
    
    if (data) setInvoices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [supabase]);

  const markAsPaid = async (id: string) => {
    const { error } = await supabase.from("invoices").update({ status: "Paid" }).eq("id", id);
    if (!error) fetchInvoices();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat invoice...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Invoice</h1>
        <p className="text-gray-500 text-sm">Pantau status pembayaran dari klien Anda.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Klien & Proyek</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Jatuh Tempo</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{inv.projects?.clients?.name}</p>
                  <p className="text-xs text-gray-500">{inv.projects?.title}</p>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  Rp {inv.amount.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(inv.due_date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {inv.status !== 'Paid' && (
                    <button 
                      onClick={() => markAsPaid(inv.id)}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Tandai Lunas
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">Belum ada invoice yang dibuat.</div>
        )}
      </div>
    </div>
  );
}