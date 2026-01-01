import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server' // Perbaikan: NextRequest dari sini

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    // Response cookies diset di sini agar sesi tersimpan di browser
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: any) {
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // Cek apakah ada user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Jika BELUM login & mencoba akses halaman selain /login, lempar ke /login
    // Kami juga mengecualikan /auth karena itu rute untuk proses callback email
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') // Pastikan ini ada
    ) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Jika SUDAH login & mencoba akses halaman /login, lempar ke /projects
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/projects', request.url))
    }

    return response
}

export const config = {
    // Menentukan halaman mana saja yang akan dipantau oleh middleware
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}