// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './server/services/token-generator'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const publicPaths = [
    '/log-in',
    '/api/auth/log-in',
    '/api/auth/fingerprint-login',
  ]

  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  const session_id = request.cookies.get('session_id')?.value

  if (pathname === '/') {
    if (token && session_id && (await verifyToken(token))) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/log-in', request.url))
  }

  if (!token || !session_id) {
    return NextResponse.redirect(new URL('/log-in', request.url))
  }

  const decodedToken = await verifyToken(token)
  if (!decodedToken) {
    return NextResponse.redirect(new URL('/log-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/log-in',
    '/api/auth/log-in',
    '/api/auth/fingerprint-login',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/((?!auth/log-in|auth/fingerprint-login).*)',
  ],
}
