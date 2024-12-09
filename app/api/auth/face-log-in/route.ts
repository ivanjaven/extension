import { type NextRequest , NextResponse} from 'next/server'
import * as faceapi from 'face-api.js'
import { Query } from '@/lib/db-con-helper'
import { generateToken } from '@/server/services/token-generator'
import {
  createSession,
  getActiveSession,
} from '@/server/services/session-manager'

export async function POST(request: NextRequest) {
  try {
     const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get face descriptor from request
    const { face } = await request.json()

    // Convert face descriptor to the correct format
    const faceDescriptor = face.map((val: number) => val)
    
    // Fetch all residents' face descriptors
    const residents = await Query({
      query: 'SELECT resident_id, face_descriptor FROM residents',
      values: [],
    })

    // Set a threshold for face matching (adjust as needed)
    const FACE_MATCH_THRESHOLD = 0.5 // Lower means stricter matching

    // Store potential matches
    const potentialMatches: Array<{residentId: string, distance: number}> = []

    // Check each resident's face descriptor
    for (const resident of residents) {
      try {
        // Parse stored face descriptor
        const storedDescriptor = JSON.parse(resident.face_descriptor)
        
        // Ensure the stored descriptor is an array of numbers
        const parsedStoredDescriptor = Object.keys(storedDescriptor).map(
          key => storedDescriptor[key]
        )

        // Calculate Euclidean distance
        const distance = faceapi.euclideanDistance(
          new Float32Array(faceDescriptor), 
          new Float32Array(parsedStoredDescriptor)
        )

        // Add to potential matches if within threshold
        if (distance < FACE_MATCH_THRESHOLD) {
          potentialMatches.push({
            residentId: resident.resident_id,
            distance: distance
          })
        }
      } catch (parseError) {
        console.warn(`Error processing resident ${resident.resident_id}`, parseError)
      }
    }

    // Find the best match (lowest distance)
    if (potentialMatches.length > 0) {
      const bestMatch = potentialMatches.reduce((prev, current) => 
        (prev.distance < current.distance) ? prev : current
      )

      console.log(`Best match resident ID: ${bestMatch.residentId}, Distance: ${bestMatch.distance}`)

      // perform login with issuing session and token
    // Find user
     const user = await Query({
        query:
          'SELECT * FROM auth WHERE resident_id = ?',
        values: [bestMatch.residentId],
      })
  
      const foundUser = user[0]

       // Generate token
    const token = await generateToken({
        auth_id: foundUser.auth_id,
        username: foundUser.username,
        role: foundUser.role,
      })
  
      // Create session
      const session_id = await createSession({
        auth_id: foundUser.auth_id,
        token: token,
        device_info: userAgent,
      })

      // Create response with cookies
        const response = new NextResponse(
        JSON.stringify({
            success: true,
            username: foundUser.username,
            auth_id: foundUser.auth_id,
            role: foundUser.role,
        }),
        {
            status: 200,
            headers: {
            'Content-Type': 'application/json',
            },
        },
        )

        // Set cookies with appropriate options
        const cookieOptions = {
        path: '/',
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax' as const,
        maxAge: 24 * 60 * 60, // 24 hours in seconds
        }

        response.cookies.set('token', token, cookieOptions)
        response.cookies.set('session_id', session_id, cookieOptions)

        return response

    } else {
      return new Response(JSON.stringify({ 
        error: 'No matching face found' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Face recognition error:', error)
    return new Response(JSON.stringify({ 
      error: 'Unexpected error during face recognition' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}