import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'

export async function DELETE(request: NextRequest) {
  try {
    // Log the incoming request and parameters
    APILogger(request, null)

    // Parse the request body
    const body = await request.json()

    // Extract resident_id from request body
    const { resident_id } = body

    // Validate required field
    if (!resident_id) {
      return APIResponse({ error: 'Resident ID is required' }, 400)
    }

    // Finally, delete from residents table
    const result = await Query({
      query: 'DELETE FROM residents WHERE resident_id = ?',
      values: [resident_id],
    })

    // Check if any record was actually deleted
    if (result.affectedRows === 0) {
      return APIResponse({ error: 'Resident not found' }, 404)
    }

    return APIResponse(
      {
        message: 'Resident and related records deleted successfully',
        id: resident_id,
      },
      200
    )
  } catch (error: any) {
    console.error('Database query failed:', error)

    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }

    return APIResponse({ error: 'Internal server error' }, 500)
  }
}