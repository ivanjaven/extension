// server/services/session-manager.ts
import { v4 as uuidv4 } from 'uuid'
import { Query } from '@/lib/db-con-helper'

interface SessionData {
  auth_id: number
  token: string
  device_info: string
}

export async function createSession(data: SessionData): Promise<string> {
  // Generate unique session ID
  const session_id = uuidv4()

  try {
    // First invalidate any existing sessions for this user
    await invalidateUserSessions(data.auth_id)

    // Create new session
    await Query({
      query: `
        INSERT INTO sessions
        (session_id, auth_id, token, device_info, last_active)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      values: [session_id, data.auth_id, data.token, data.device_info],
    })

    return session_id
  } catch (error) {
    console.error('Error creating session:', error)
    throw new Error('Failed to create session')
  }
}

export async function validateSession(
  session_id: string,
  auth_id: number,
): Promise<boolean> {
  try {
    const result = await Query({
      query: `
        SELECT * FROM sessions
        WHERE session_id = ?
        AND auth_id = ?
        AND last_active > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 24 HOUR)
      `,
      values: [session_id, auth_id],
    })

    if (!result || result.length === 0) {
      return false
    }

    // Update last_active timestamp
    await Query({
      query:
        'UPDATE sessions SET last_active = CURRENT_TIMESTAMP WHERE session_id = ?',
      values: [session_id],
    })

    return true
  } catch (error) {
    console.error('Error validating session:', error)
    return false
  }
}

export async function invalidateUserSessions(auth_id: number): Promise<void> {
  try {
    await Query({
      query: 'DELETE FROM sessions WHERE auth_id = ?',
      values: [auth_id],
    })
  } catch (error) {
    console.error('Error invalidating sessions:', error)
    throw new Error('Failed to invalidate sessions')
  }
}

export async function deleteSession(session_id: string): Promise<void> {
  try {
    await Query({
      query: 'DELETE FROM sessions WHERE session_id = ?',
      values: [session_id],
    })
  } catch (error) {
    console.error('Error deleting session:', error)
    throw new Error('Failed to delete session')
  }
}

export async function getActiveSession(auth_id: number): Promise<any> {
  try {
    const result = await Query({
      query: `
        SELECT * FROM sessions
        WHERE auth_id = ?
        AND last_active > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 24 HOUR)
      `,
      values: [auth_id],
    })

    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('Error getting active session:', error)
    return null
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await Query({
      query: `
        DELETE FROM sessions
        WHERE last_active < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 24 HOUR)
      `,
      values: [],
    })
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
  }
}
