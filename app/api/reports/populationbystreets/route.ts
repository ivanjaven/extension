import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'


export async function GET(request: NextRequest) {
  try {
     // Log the incoming request and parameters
     APILogger(request, null)
 
     // Execute the database query to fetch user details by ID
     const res = await Query({
       query: `
        SELECT 
            s.street_name,
            COUNT(DISTINCT r.resident_id) as resident_count
        FROM streets s
        LEFT JOIN addresses a ON s.street_id = a.street_id
        LEFT JOIN residents r ON a.resident_id = r.resident_id AND r.is_archived = FALSE
        GROUP BY 
            s.street_id,
            s.street_name
        ORDER BY 
            street_name
     `,
       values: [],
     })
 
     console.log('Query Result:', res)
 
     // Check if the user was found
     if (res.length === 0) {
       return APIResponse({ error: 'User not found' }, 404)
     }
 
     // Return the formatted response
     return APIResponse(res, 200)
  } catch (error: any) {
    console.error('Database query failed:', error)

    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }

    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
