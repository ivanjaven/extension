// server/services/token-generator.ts
import { jwtVerify, SignJWT } from 'jose'

// Extending JWTPayload to include our custom fields
interface JWTCustomPayload {
  [key: string]: any
  auth_id: number
  username: string
  role: string
  iat?: number
  exp?: number
}

export async function generateToken(
  payload: JWTCustomPayload,
): Promise<string> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }

  // Create JWT with custom payload
  try {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    return token
  } catch (error) {
    console.error('Token generation failed:', error)
    throw new Error('Failed to generate token')
  }
}

export async function verifyToken(
  token: string,
): Promise<JWTCustomPayload | null> {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
    )

    // Type assertion after validation
    const customPayload = payload as JWTCustomPayload

    // Verify required fields exist
    if (
      !customPayload.auth_id ||
      !customPayload.username ||
      !customPayload.role
    ) {
      throw new Error('Invalid token payload structure')
    }

    return customPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}
