import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect /dashboard and /qr routes. If an auth cookie is not present, redirect to /login.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  const publicPaths = ['/', '/login', '/auth/callback', '/favicon.ico', '/api']
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Only protect the specific routes we care about
  const protectedPaths = ['/dashboard', '/qr']
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  const cookieHeader = req.headers.get('cookie') || ''

  // Check for common Supabase auth cookie names. If any exists, assume user may be authenticated.
  const authCookieNames = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'sb:token',
    'sb_token',
  ]

  const hasAuthCookie = authCookieNames.some((name) => cookieHeader.includes(`${name}=`))

  if (!hasAuthCookie) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/qr/:path*'],
}
