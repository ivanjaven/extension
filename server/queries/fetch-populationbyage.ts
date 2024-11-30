import { PopulationByAgeTypedef } from '@/lib/typedef/populationbyage-typedef'

export async function fetchpopulationbyage(): Promise<PopulationByAgeTypedef[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = '/api/reports/populationbyage'

  try {
    const response = await fetch(`${baseUrl}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: PopulationByAgeTypedef[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching batches:', error)
    throw error
  }
}
