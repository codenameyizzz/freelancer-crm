"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });
      
      if (data) setProjects(data);
      setLoading(false);
    }
    fetchProjects();
  }, [supabase]);

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat proyek...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Proyek</h1>
          <p className="text-gray-500 text-sm">Kelola semua pekerjaan aktif Anda di sini.</p>
        </div>
        <Link 
          href="/projects/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Proyek Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {project.clients?.name}
                </p>
                <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">Budget</p>
                  <p className="text-sm font-bold text-gray-900">Rp {project.budget?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">Deadline</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(project.deadline).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              
              <Link 
                href={`/invoices/new/${project.id}`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Tagih Invoice →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}