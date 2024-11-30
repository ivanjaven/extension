import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query } from '@/lib/db-con-helper'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Log the incoming request and parameters
    APILogger(request, params)

    const { id } = params

    // Validate that the ID parameter is provided and is numeric
    if (!id || isNaN(Number(id))) {
      return APIResponse({ error: 'Valid ID parameter is required' }, 400)
    }

    // Fetch data from the database using the updated query
    const user = await Query({
      query: `
        SELECT 
          r.resident_id,
          r.first_name AS name,
          r.last_name AS surname,
          r.middle_name AS middlename, 
          r.gender,
          r.image_base64,
          DATE_FORMAT(r.date_of_birth, '%Y-%m-%d') AS date_of_birth,
          r.civil_status AS status,
          r.is_archived AS archive,
          r.occupation_id AS occupation,
          r.nationality_id AS nationality,
          r.religion_id AS religion,
          r.benefit_id AS benefits,
          c.contact_id,
          c.email,
          c.mobile,
          a.address_id,
          a.house_number AS houseNumber,
          s.street_id AS street
        FROM residents r
        LEFT JOIN contacts c ON r.resident_id = c.resident_id
        LEFT JOIN addresses a ON r.resident_id = a.resident_id
        LEFT JOIN streets s ON a.street_id = s.street_id
        WHERE r.resident_id = ?
      `,
      values: [id],
    })

    // Check if the user was found
    if (!user || user.length === 0) {
      return APIResponse({ error: 'Resident not found' }, 404)
    }

    // Return the formatted response
    return APIResponse(user, 200)
  } catch (error: any) {
    console.error('Database query failed:', error)

    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }

    return APIResponse({ error: 'Internal server error' }, 500)
  }
}
