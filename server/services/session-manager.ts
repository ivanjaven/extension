// server/services/session-manager.ts
import { v4 as uuidv4 } from 'uuid'
import { Query } from '@/lib/db-con-helper'

interface SessionData {
  auth_id: number
  token: string
  device_info: string
}

export async function createSession(data: SessionData): Promise<string> {
  await invalidateUserSessions(data.auth_id)

  const session_id = uuidv4()

  await Query({
    query: `INSERT INTO sessions (session_id, auth_id, token, device_info)
            VALUES (?, ?, ?, ?)`,
    values: [session_id, data.auth_id, data.token, data.device_info],
  })

  return session_id
}

export async function validateSession(
  session_id: string,
  auth_id: number,
): Promise<boolean> {
  const result = await Query({
    query: `SELECT * FROM sessions
            WHERE session_id = ? AND auth_id = ?
            AND last_active > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
    values: [session_id, auth_id],
  })

  if (result.length === 0) {
    return false
  }

  await Query({
    query: `UPDATE sessions SET last_active = CURRENT_TIMESTAMP
            WHERE session_id = ?`,
    values: [session_id],
  })

  return true
}

export async function invalidateUserSessions(auth_id: number): Promise<void> {
  await Query({
    query: 'DELETE FROM sessions WHERE auth_id = ?',
    values: [auth_id],
  })
}

export async function deleteSession(session_id: string): Promise<void> {
  await Query({
    query: 'DELETE FROM sessions WHERE session_id = ?',
    values: [session_id],
  })
}

export async function getActiveSession(auth_id: number): Promise<any> {
  const result = await Query({
    query: `SELECT * FROM sessions
            WHERE auth_id = ?
            AND last_active > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
    values: [auth_id],
  })

  return result.length > 0 ? result[0] : null
}
