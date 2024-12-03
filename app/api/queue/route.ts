import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'

export async function DELETE(request: NextRequest) {
  try {
    APILogger(request, null)

    const body = await request.json()
    const queue_id = body.queue_id

    if (!queue_id) {
      return APIResponse({ error: 'Queue ID is required' }, 400)
    }

    const queueResult = await Query({
      query: 'DELETE FROM queue WHERE queue_id = ?',
      values: [queue_id],
    })

    if (queueResult.length === 0) {
      return APIResponse({ error: 'Queue record not found' }, 404)
    }

    return APIResponse(
      {
        success: true,
        message: 'Queue record deleted successfully',
        deletedId: queue_id,
      },
      200,
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
