import { PopulationByStreetsTypedef } from '@/lib/typedef/populationbystreets-typedef'

export async function fetchpopulationbystreets(): Promise<PopulationByStreetsTypedef[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = '/api/reports/populationbystreets'

  try {
    const response = await fetch(`${baseUrl}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: PopulationByStreetsTypedef[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching batches:', error)
    throw error
  }
}
