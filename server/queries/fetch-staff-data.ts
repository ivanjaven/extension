import { StaffInformationTypedef } from '@/lib/typedef/staff-information-typedef'

export async function fetchStaff(
  authId: number,
): Promise<StaffInformationTypedef | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = `/api/users/staff-data/id/${authId}` 

  try {
    const response = await fetch(`${baseUrl}${endpoint}`)

    console.log(`Fetching staff data from: ${baseUrl}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: StaffInformationTypedef = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching staff data:', error)
    return null
  }
}
