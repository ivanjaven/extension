import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'
import { hashPassword } from '@/lib/password-hash'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, newPassword, auth_id } = body

    APILogger(request, { auth_id, username })

    // Build update query dynamically based on provided fields
    let updateQuery = 'UPDATE auth SET'
    const queryValues = []
    const updates = []

    if (username) {
      updates.push(' username = ?')
      queryValues.push(username)
    }

    if (newPassword) {
      const hashedPassword = await hashPassword(newPassword)
      updates.push(' password = ?')
      queryValues.push(hashedPassword)
    }

    // Complete the query
    updateQuery += updates.join(',') + ' WHERE auth_id = ?'
    queryValues.push(auth_id)

    // Execute update query
    await Query({
      query: updateQuery,
      values: queryValues,
    })

    return APIResponse({ message: 'Profile updated successfully' }, 200)
  } catch (error: any) {
    console.error('Profile update failed:', error)

    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }

    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
