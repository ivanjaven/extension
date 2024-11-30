// app/api/auth/fingerprint-login/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'
import { generateToken } from '@/server/services/token-generator'

export async function POST(request: NextRequest) {
  try {
    const { username, authId, role } = await request.json()

    APILogger(request, { username })

    console.log('Starting to veify fingerprint')
    // Verify the user exists in the database
    const users = await Query({
      query:
        'SELECT * FROM auth WHERE auth_id = ? AND username = ? AND role = ?',
      values: [authId, username, role],
    })

    if (users.length === 0) {
      return APIResponse({ error: 'User not found' }, 404)
    }

    console.log('Starting to verify fingerprint')
    const user = users[0]

    // Generate JWT token exactly like traditional login
    const token = await generateToken({
      auth_id: user.auth_id,
      username: user.username,
      role: user.role,
    })

    console.log('Before creating response')

    // Create response exactly like traditional login
    const response = NextResponse.json(
      {
        token, // Include token in response body
        username: user.username,
        auth_id: user.auth_id,
        role: user.role,
      },
      { status: 200 },
    )

    // Set cookie exactly like traditional login
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    console.log('Response created, returnin...')
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
