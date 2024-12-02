// app/api/auth/log-in/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'
import { compare } from 'bcryptjs'
import { generateToken } from '@/server/services/token-generator'
import {
  createSession,
  getActiveSession,
} from '@/server/services/session-manager'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    const userAgent = request.headers.get('user-agent') || 'unknown'

    APILogger(request, { username })

    const users = await Query({
      query: 'SELECT * FROM auth WHERE username = ?',
      values: [username],
    })

    if (users.length === 0) {
      return APIResponse({ error: 'User not found' }, 404)
    }

    // Check for existing active session
    const existingSession = await getActiveSession(users[0].auth_id)
    if (existingSession) {
      return APIResponse(
        {
          error: 'Account is already logged in on another device',
          isActiveSession: true,
        },
        403,
      )
    }

    // Find user with matching password
    let foundUser = null
    for (const user of users) {
      const passwordMatch = await compare(password, user.password)
      if (passwordMatch) {
        foundUser = user
        break
      }
    }

    if (!foundUser) {
      return APIResponse({ error: 'Invalid credentials' }, 401)
    }

    // Generate token and create session
    const token = await generateToken({
      auth_id: foundUser.auth_id,
      username: foundUser.username,
      role: foundUser.role,
    })

    const session_id = await createSession({
      auth_id: foundUser.auth_id,
      token: token,
      device_info: userAgent,
    })

    const response = NextResponse.json(
      {
        username: foundUser.username,
        auth_id: foundUser.auth_id,
        role: foundUser.role,
      },
      { status: 200 },
    )

    // Set tokens in cookies
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    response.cookies.set('session_id', session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    console.log('API authentication successful')
    console.log(response)

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
