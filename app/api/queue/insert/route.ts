import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'

interface ResidentRequest {
  resident_id: number
  document: string
}

export async function POST(request: NextRequest) {
  try {
    APILogger(request, null)

    // Parse the JSON body to get resident_id and document
    const body = await request.json()
    const { resident_id, document } = body as ResidentRequest

    // Validate if both resident_id and document are provided
    if (!resident_id || !document) {
      return APIResponse({ error: 'Both resident_id and document are required' }, 400)
    }

    // Insert the request into the queue (database)
    const result = await Query({
      query:
        'INSERT INTO queue (resident_id, document) VALUES (?, ?);',
      values: [resident_id, document],
    })

    // If no rows were inserted, something went wrong
    if (result.affectedRows === 0) {
      return APIResponse({ error: 'Failed to add document request to queue' }, 500)
    }

    // Return a successful response
    return APIResponse({ message: 'Document request added to queue successfully' }, 200)
  } catch (error: any) {
    console.error('Database query failed:', error)

    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }

    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
