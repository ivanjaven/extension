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
    CASE 
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 1 THEN 'New born'
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 1 AND 12 THEN 'Child'
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 13 AND 19 THEN 'Teenager'
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 20 AND 59 THEN 'Adult'
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= 60 THEN 'Senior Citizen'
    END as age_category,
    COUNT(DISTINCT resident_id) as resident_count
FROM residents
WHERE is_archived = FALSE
GROUP BY age_category
ORDER BY 
    CASE age_category
        WHEN 'New born' THEN 1
        WHEN 'Child' THEN 2
        WHEN 'Teenager' THEN 3
        WHEN 'Adult' THEN 4
        WHEN 'Senior Citizen' THEN 5
    END
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
