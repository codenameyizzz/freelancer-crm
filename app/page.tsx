"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalRevenue: 0, pendingAmount: 0, activeProjects: 0 });
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: invoices } = await supabase.from("invoices").select("amount, status");
      const { count: projectCount } = await supabase.from("projects").select("*", { count: 'exact', head: true }).eq("status", "In Progress");

      let revenue = 0;
      let pending = 0;

      invoices?.forEach(inv => {
        if (inv.status === 'Paid') revenue += Number(inv.amount);
        else pending += Number(inv.amount);
      });

      setStats({ totalRevenue: revenue, pendingAmount: pending, activeProjects: projectCount || 0 });
    }
    fetchDashboardData();
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang, Yizreel!</h1>
        <p className="text-gray-500">Berikut adalah ringkasan bisnis Anda hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Pendapatan" value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`} color="text-green-600" />
        <StatCard title="Tagihan Pending" value={`Rp ${stats.pendingAmount.toLocaleString('id-ID')}`} color="text-orange-600" />
        <StatCard title="Proyek Aktif" value={stats.activeProjects.toString()} color="text-blue-600" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="font-semibold mb-4">Aksi Cepat</h2>
        <div className="flex gap-4">
          <Link href="/projects/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Proyek Baru
          </Link>
          <Link href="/clients/new" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            Tambah Klien
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}