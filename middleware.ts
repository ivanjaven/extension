import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './server/services/token-generator'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // List of paths that don't require authentication
  const publicPaths = [
    '/log-in',
    '/api/auth/log-in',
    '/api/auth/fingerprint-login',
  ]

  // Skip middleware for public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value

  console.log('Token from cookie:', token)

  // Special handling for root path
  if (pathname === '/') {
    if (token && (await verifyToken(token))) {
      return NextResponse.next()
    } else {
      return NextResponse.redirect(new URL('/log-in', request.url))
    }
  }

  if (!token) {
    console.log('No token found, redirecting to login')
    return NextResponse.redirect(new URL('/log-in', request.url))
  }

  const decodedToken = await verifyToken(token)
  if (!decodedToken) {
    console.log('Invalid token, redirecting to login')
    return NextResponse.redirect(new URL('/log-in', request.url))
  }

  return NextResponse.next()
}

// Update matcher to include fingerprint-login route
export const config = {
  matcher: [
    '/log-in',
    '/api/auth/log-in',
    '/api/auth/fingerprint-login',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/((?!auth/log-in|auth/fingerprint-login).*)',
  ],
}
