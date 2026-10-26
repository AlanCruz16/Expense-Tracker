import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = sameSitePath(searchParams.get('next'), origin) ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

// Only a path inside this app: one leading '/', no '//' or '/\' (browsers read both as a new host),
// and it must still resolve to our own origin after URL parsing strips tabs and newlines.
// Dot segments can normalize to a leading '//' (e.g. '/.//evil.com'), so check the result too.
function sameSitePath(next: string | null, origin: string) {
    if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null
    const url = new URL(next, origin)
    if (url.origin !== origin || url.pathname.startsWith('//')) return null
    return `${url.pathname}${url.search}${url.hash}`
}
