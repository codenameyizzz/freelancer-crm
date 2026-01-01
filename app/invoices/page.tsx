"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

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

  if (loading) return <div className="p-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading experience...</div>;

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Invoices</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{invoices.length} Records Found</p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-900">
              <th className="py-6 text-[10px] font-bold text-slate-900 uppercase tracking-widest">Client & Project</th>
              <th className="py-6 text-[10px] font-bold text-slate-900 uppercase tracking-widest">Amount</th>
              <th className="py-6 text-[10px] font-bold text-slate-900 uppercase tracking-widest text-center">Status</th>
              <th className="py-6 text-[10px] font-bold text-slate-900 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="group transition-colors">
                <td className="py-8">
                  <div className="font-bold text-slate-900">{inv.projects?.clients?.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{inv.projects?.title}</div>
                </td>
                <td className="py-8 text-sm font-medium text-slate-900">
                  Rp {inv.amount.toLocaleString('id-ID')}
                </td>
                <td className="py-8 text-center">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 ${
                    inv.status === 'Paid' ? 'text-green-500' : 'text-amber-500'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-8 text-right">
                  <div className="flex justify-end items-center gap-6">
                    <Link 
                      href={`/invoices/print/${inv.id}`}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      View
                    </Link>
                    {inv.status !== 'Paid' && (
                      <button 
                        onClick={() => markAsPaid(inv.id)}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border border-slate-900 px-4 py-2 hover:bg-slate-900 hover:text-white transition-all"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}