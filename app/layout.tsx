"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50 text-gray-900`}>
        {isLoginPage ? (
          children
        ) : (
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
              <div className="p-6">
                <h1 className="text-xl font-bold text-blue-600 tracking-tight">Freelance CRM</h1>
              </div>
              
              <nav className="flex-1 px-4 space-y-1">
                <NavLink href="/" active={pathname === "/"}>Dashboard</NavLink>
                <NavLink href="/projects" active={pathname.startsWith("/projects")}>Proyek</NavLink>
                <NavLink href="/invoices" active={pathname.startsWith("/invoices")}>Invoice</NavLink>
                <NavLink href="/clients/new" active={pathname === "/clients/new"}>Tambah Klien</NavLink>
              </nav>

              <div className="p-4 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Keluar Akun
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
        active 
          ? "bg-blue-50 text-blue-700" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}