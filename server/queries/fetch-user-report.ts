import { UserInformationReportTypedef } from '@/lib/typedef/user-information-report-typedef'
import { UserInformationTypedef } from '@/lib/typedef/user-information-typedef'

export async function fetchUserReport(
  query: number,
): Promise<UserInformationReportTypedef[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = `/api/search/resident/report/${query}`

  try {
    const response = await fetch(`${baseUrl}${endpoint}`)

    console.log(`fetching url: ${baseUrl}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: UserInformationReportTypedef[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching resident suggestions:', error)
    throw error
  }
}
