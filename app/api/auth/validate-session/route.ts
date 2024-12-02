// app/api/auth/validate-session/route.ts
import { NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { validateSession } from '@/server/services/session-manager'
import { verifyToken } from '@/server/services/token-generator'

export async function POST(request: NextRequest) {
  try {
    const session_id = request.cookies.get('session_id')?.value
    const token = request.cookies.get('token')?.value

    if (!session_id || !token) {
      return APIResponse({ error: 'Invalid session' }, 401)
    }

    const decodedToken = await verifyToken(token)
    if (!decodedToken) {
      return APIResponse({ error: 'Invalid token' }, 401)
    }

    const isValid = await validateSession(session_id, decodedToken.auth_id)
    if (!isValid) {
      return APIResponse({ error: 'Session expired' }, 401)
    }

    return APIResponse({ valid: true }, 200)
  } catch (error) {
    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
