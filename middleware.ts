// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './server/services/token-generator'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProduction = process.env.NODE_ENV === 'production'

  // Define public paths that don't require authentication
  const publicPaths = [
    '/log-in',
    '/api/auth/log-in',
    '/api/auth/fingerprint-login',
    '/terms',
    '/privacy',
  ]

  console.log('Middleware path:', pathname)
  console.log('Cookies:', {
    token: request.cookies.get('token')?.value ? 'present' : 'missing',
    session_id: request.cookies.get('session_id')?.value
      ? 'present'
      : 'missing',
  })

  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  const session_id = request.cookies.get('session_id')?.value

  // In development, only check for token
  if (!isProduction && !token) {
    console.log('Missing token in development, redirecting to login')
    return NextResponse.redirect(new URL('/log-in', request.url))
  }

  // In production, check both token and session_id
  if (isProduction && (!token || !session_id)) {
    console.log('Missing auth cookies in production, redirecting to login')
    return NextResponse.redirect(new URL('/log-in', request.url))
  }

  try {
    // Only verify token if it exists
    if (!token) {
      throw new Error('No token provided')
    }

    const decodedToken = await verifyToken(token)
    if (!decodedToken) {
      console.log('Invalid token, redirecting to login')
      const response = NextResponse.redirect(new URL('/log-in', request.url))
      response.cookies.delete('token')
      response.cookies.delete('session_id')
      return response
    }
    return NextResponse.next()
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.redirect(new URL('/log-in', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Optional: Add specific API routes that need protection
    '/api/:path*',
  ],
}
