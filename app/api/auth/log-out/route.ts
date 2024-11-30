import { type NextRequest, NextResponse } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APILogger } from '@/lib/api-req-logger'

export async function POST(request: NextRequest) {
  try {
    APILogger(request, 'Log out')

    // Create response object
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 },
    )

    // Clear the token cookie by setting it to expire immediately
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // This makes the cookie expire immediately
    })

    console.log('Logout successful')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
