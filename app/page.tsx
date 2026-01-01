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
    <div className="space-y-16">
      <header>
        <h1 className="text-4xl font-light text-slate-900 tracking-tight">
          Welcome back, <span className="font-bold">Yizreel</span>
        </h1>
        <div className="w-12 h-1 bg-slate-900 mt-6"></div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-slate-100">
        <StatItem title="Total Revenue" value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`} />
        <StatItem title="Pending Payment" value={`Rp ${stats.pendingAmount.toLocaleString('id-ID')}`} />
        <StatItem title="Active Projects" value={stats.activeProjects.toString()} />
      </section>

      <section className="bg-slate-900 p-12 rounded-sm flex justify-between items-center">
        <div>
          <h2 className="text-white text-xl font-medium tracking-tight">Ready for a new project?</h2>
          <p className="text-slate-400 text-sm mt-2">Manage your workflow and finances in one place.</p>
        </div>
        <Link href="/projects/new" className="bg-white text-slate-900 px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors">
          Create Project
        </Link>
      </section>
    </div>
  );
}

function StatItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-10 border-r border-b border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{title}</p>
      <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}