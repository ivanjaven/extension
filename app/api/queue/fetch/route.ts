import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'

export async function GET(request: NextRequest) {
  try {
    APILogger(request, null)

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '25', 10)
    const offset = (page - 1) * limit

    const logs = await Query({
      query: `
        SELECT 
    q.queue_id AS id,
    q.resident_id,
    q.document,
    r.full_name AS name,
    CASE q.document
        WHEN 'Barangay Business Clearance' THEN 'Bus. Clearance'
        WHEN 'Barangay Clearance' THEN 'Brgy. Clearance'
        WHEN 'Certificate of Indigency' THEN 'Indigency Cert.'
        WHEN 'Certificate of Residency' THEN 'Residency Cert.'
        ELSE LEFT(q.document, 15)
    END AS label,
    DATE_FORMAT(q.created_at, '%Y-%m-%d %h:%i:%s %p') AS date
FROM 
    queue q
INNER JOIN 
    residents r ON q.resident_id = r.resident_id
ORDER BY 
    q.created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      values: [limit, offset],
    })

    if (logs.length === 0 && page === 1) {
      return APIResponse({ message: 'No document logs found', data: [] }, 200)
    }

    return APIResponse({ data: logs }, 200)
  } catch (error: any) {
    console.error('Database query failed:', error)
    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }
    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
