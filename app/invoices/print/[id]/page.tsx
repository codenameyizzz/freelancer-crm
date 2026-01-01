"use client";

import { useEffect, useState, useRef, use } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useReactToPrint } from "react-to-print";

export default function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<any>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchInvoiceDetail() {
      const { data } = await supabase
        .from("invoices")
        .select("*, projects(title, clients(name, email))")
        .eq("id", id)
        .single();
      if (data) setInvoice(data);
    }
    fetchInvoiceDetail();
  }, [id, supabase]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${id}`,
  });

  if (!invoice) return <p className="p-10 text-center">Memuat invoice...</p>;

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto mb-6 flex justify-end no-print">
        <button
          onClick={() => (handlePrint())}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all"
        >
          Cetak ke PDF
        </button>
      </div>

      {/* Area yang akan dicetak */}
      <div 
        ref={componentRef} 
        className="bg-white p-12 shadow-sm border border-gray-200 mx-auto w-full"
        style={{ minHeight: '29.7cm' }} // Ukuran A4
      >
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-blue-600 mb-2">INVOICE</h1>
            <p className="text-gray-500">ID: #{invoice.id.slice(0, 8)}</p>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-lg">Dari:</h2>
            <p className="text-gray-600">{/* Nama Kamu/Brand */}</p>
            <p className="text-gray-600">Yizreel Freelance Service</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2">Ditujukan Untuk:</h3>
            <p className="font-bold text-xl">{invoice.projects?.clients?.name}</p>
            <p className="text-gray-600">{invoice.projects?.clients?.email}</p>
          </div>
          <div className="text-right">
            <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2">Detail Tagihan:</h3>
            <p className="text-gray-600">Tanggal: {new Date(invoice.created_at).toLocaleDateString('id-ID')}</p>
            <p className="text-gray-600 font-bold text-red-500">Jatuh Tempo: {new Date(invoice.due_date).toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-gray-100 text-left">
              <th className="py-4 font-bold text-gray-700">Deskripsi Proyek</th>
              <th className="py-4 font-bold text-gray-700 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-6">
                <p className="font-bold text-gray-900">{invoice.projects?.title}</p>
                <p className="text-sm text-gray-500 italic">Jasa Pengembangan Proyek</p>
              </td>
              <td className="py-6 text-right font-bold text-xl">
                Rp {invoice.amount.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end pt-8">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>Rp {invoice.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-2xl font-black text-gray-900">
              <span>TOTAL</span>
              <span>Rp {invoice.amount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t pt-8 text-center text-gray-400 text-sm">
          <p>Terima kasih atas kepercayaan Anda menggunakan jasa kami.</p>
          <p className="mt-2 font-medium text-blue-500">www.freelance-crm.com</p>
        </div>
      </div>
    </div>
  );
}