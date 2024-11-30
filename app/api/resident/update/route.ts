import { type NextRequest } from 'next/server'
import { APIResponse } from '@/lib/api-res-helper'
import { APIErrHandler } from '@/lib/api-err-handler'
import { APILogger } from '@/lib/api-req-logger'
import { Query} from '@/lib/db-con-helper'

export async function PUT(request: NextRequest) {
  try {
    // Log the incoming request and parameters
    APILogger(request, null)

    // Parse the request body
    const body = await request.json()

    // Extract resident data from request body
    const {
      resident_id,
      full_name,
      first_name,
      last_name,
      middle_name,
      gender,
      date_of_birth,
      civil_status,
      house_number,
      street_id,
      email,
      mobile,
      occupation_id,
      nationality_id,
      religion_id,
      benefit_id,
      address_id,
      contact_id
    } = body

    // Validate required fields
    if (
      !resident_id ||
      !full_name ||
      !first_name ||
      !last_name ||
      !gender ||
      !date_of_birth ||
      !civil_status ||
      !house_number ||
      !street_id ||
      !email ||
      !mobile ||
      !occupation_id ||
      !nationality_id ||
      !religion_id ||
      !benefit_id ||
      !address_id ||
      !contact_id
    ) {
      return APIResponse({ error: 'All required parameters are needed' }, 400)
    }

    try {
      // Update resident information
      await Query({
        query: `
          UPDATE residents 
          SET full_name = ?, 
              first_name = ?, 
              last_name = ?, 
              middle_name = ?, 
              gender = ?, 
              date_of_birth = ?, 
              civil_status = ?, 
              occupation_id = ?, 
              nationality_id = ?, 
              religion_id = ?, 
              benefit_id = ?
          WHERE resident_id = ?
        `,
        values: [
          full_name,
          first_name,
          last_name,
          middle_name,
          gender,
          date_of_birth,
          civil_status,
          occupation_id,
          nationality_id,
          religion_id,
          benefit_id,
          resident_id
        ],
      })

      // Update address information
      await Query({
        query: `
          UPDATE addresses 
          SET house_number = ?, 
              street_id = ?
          WHERE address_id = ?
        `,
        values: [
          house_number,
          street_id,
          address_id
        ],
      })

      // Update contact information
      await Query({
        query: `
          UPDATE contacts 
          SET email = ?, 
              mobile = ?
          WHERE contact_id = ?
        `,
        values: [
          email,
          mobile,
          contact_id
        ],
      })

      return APIResponse(
        {
          message: 'Resident, address, and contact updated successfully',
          resident_id: resident_id
        },
        200
      )
    } catch (error) {
      throw error // Re-throw to be caught by outer catch block
    }
  } catch (error: any) {
    console.error('Database query failed:', error)

    const apiError = APIErrHandler(error)
    if (apiError) {
      return apiError
    }

    return APIResponse({ error: 'Internal server error' }, 500)
  }
}