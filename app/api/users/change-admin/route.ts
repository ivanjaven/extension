// app/api/users/change-admin/route.ts

import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'

export async function PUT(request: NextRequest) {
  try {
    const { currentAuthId, newResidentId } = await request.json()

    APILogger(request, { currentAuthId, newResidentId })

    if (!currentAuthId || !newResidentId) {
      return APIResponse({ error: 'Missing required parameters' }, 400)
    }

    // Update the auth record
    const result = await Query({
      query: `
        UPDATE auth
        SET resident_id = ?
        WHERE auth_id = ?
      `,
      values: [newResidentId, currentAuthId],
    })

    if (result.affectedRows === 0) {
      return APIResponse({ error: 'Failed to update admin access' }, 404)
    }

    return APIResponse({ message: 'Admin access updated successfully' }, 200)
  } catch (error) {
    console.error('Database query failed:', error)

    // Type check if error is an Error object with a code property
    if (error instanceof Error && 'code' in error) {
      const apiError = APIErrHandler(error as Error & { code: string })
      if (apiError) return apiError
    }

    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
