"use client";

import { Geist } from "next/font/google";
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
      <body className={`${geistSans.variable} antialiased bg-[#FDFDFD] text-slate-900`}>
        {isLoginPage ? (
          children
        ) : (
          <div className="flex min-h-screen">
            {/* Minimalist Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-50">
              <div className="p-10">
                <h1 className="text-sm font-black tracking-[0.3em] uppercase text-slate-900">
                  FreeFlow
                </h1>
              </div>
              
              <nav className="flex-1 px-6 space-y-1">
                <NavLink href="/" active={pathname === "/"} label="Overview" />
                <NavLink href="/projects" active={pathname.startsWith("/projects")} label="Projects" />
                <NavLink href="/invoices" active={pathname.startsWith("/invoices")} label="Invoices" />
                <NavLink href="/clients/new" active={pathname === "/clients/new"} label="Add Client" />
              </nav>

              <div className="p-8">
                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors duration-300"
                >
                  Sign Out
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-12 lg:p-16">
              <div className="max-w-5xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`group flex items-center justify-between py-3 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
        active 
          ? "text-slate-900" 
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      <span>{label}</span>
      {active && <div className="w-1 h-1 bg-slate-900 rounded-full"></div>}
    </Link>
  );
}