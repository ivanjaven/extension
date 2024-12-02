// app/api/auth/log-out/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APILogger } from '@/lib/api-req-logger'
import { deleteSession } from '@/server/services/session-manager'

export async function POST(request: NextRequest) {
  try {
    APILogger(request, 'Log out')
    const session_id = request.cookies.get('session_id')?.value

    if (session_id) {
      await deleteSession(session_id)
    }

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 },
    )

    // Clear cookies
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    })

    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
