import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: number } },
) {
  try {
    const id = params.id
    APILogger(request, { id })

    if (!id) {
      return APIResponse({ error: 'ID is required' }, 400)
    }

    // Query to get staff information
    const staffData = await Query({
      query: `
        SELECT
          r.resident_id,
          r.full_name,
          r.image_base64,
          a.auth_id as auth_id,
          a.role,
          a.username
        FROM residents r
        JOIN auth a ON r.resident_id = a.resident_id
        WHERE a.auth_id = ?
      `,
      values: [id],
    })

    if (staffData.length === 0) {
      return APIResponse({ error: 'Staff not found' }, 404)
    }

    return APIResponse(staffData[0], 200)
  } catch (error: any) {
    console.error('Database query failed:', error)

    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }

    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
