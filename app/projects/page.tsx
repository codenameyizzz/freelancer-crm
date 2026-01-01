"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    // Kita join dengan tabel clients untuk mendapatkan nama kliennya
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        clients (name)
      `)
      .order("deadline", { ascending: true });

    if (data) setProjects(data);
    if (error) console.error(error);
    setLoading(false);
  }

  // Fungsi untuk menentukan warna status berdasarkan deadline
  const getDeadlineStyle = (deadlineStr: string) => {
    const today = new Date();
    const deadline = new Date(deadlineStr);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "bg-gray-100 text-gray-500"; // Sudah lewat
    if (diffDays <= 3) return "bg-red-100 text-red-700 font-bold"; // Sangat dekat
    if (diffDays <= 7) return "bg-yellow-100 text-yellow-700"; // Mendekati
    return "bg-green-100 text-green-700"; // Aman
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <Link 
          href="/projects/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Proyek Baru
        </Link>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <p className="text-gray-500">Belum ada proyek. Silakan tambah proyek baru.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white border rounded-xl p-6 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{project.title}</h3>
                <p className="text-sm text-gray-500">Klien: {project.clients?.name || "Tanpa Klien"}</p>
                <div className="mt-2 flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${getDeadlineStyle(project.deadline)}`}>
                    Deadline: {new Date(project.deadline).toLocaleDateString('id-ID')}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    Budget: Rp {project.budget?.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="text-sm border px-3 py-1 rounded hover:bg-gray-50">Detail</button>
                <button className="text-sm bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded hover:bg-green-100">
                  Tagih (Invoice)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}