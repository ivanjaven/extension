// app/api/auth/fingerprint-login/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'
import { generateToken } from '@/server/services/token-generator'
import {
  createSession,
  getActiveSession,
} from '@/server/services/session-manager'

export async function POST(request: NextRequest) {
  try {
    const { username, authId, role } = await request.json()
    const userAgent = request.headers.get('user-agent') || 'unknown'

    APILogger(request, { username })

    // Find user
    const users = await Query({
      query:
        'SELECT * FROM auth WHERE auth_id = ? AND username = ? AND role = ?',
      values: [authId, username, role],
    })

    if (users.length === 0) {
      return APIResponse({ error: 'Invalid credentials' }, 401)
    }

    const foundUser = users[0]

    // Generate token
    const token = await generateToken({
      auth_id: foundUser.auth_id,
      username: foundUser.username,
      role: foundUser.role,
    })

    // Create session
    const session_id = await createSession({
      auth_id: foundUser.auth_id,
      token: token,
      device_info: userAgent,
    })

    // Create response with cookies
    const response = new NextResponse(
      JSON.stringify({
        success: true,
        username: foundUser.username,
        auth_id: foundUser.auth_id,
        role: foundUser.role,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    // Set cookies with appropriate options
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60, // 24 hours in seconds
    }

    response.cookies.set('token', token, cookieOptions)
    response.cookies.set('session_id', session_id, cookieOptions)

    return response
  } catch (error: any) {
    console.error('Authentication error:', error)
    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }
    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
