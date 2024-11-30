import { initTypedef } from '@/lib/typedef/init-typedef'

export async function fetchInit(query: number): Promise<initTypedef[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = `/api/resident/init/id/${query}`

  try {
    const response = await fetch(`${baseUrl}${endpoint}`)

    console.log(`fetching url: ${baseUrl}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: initTypedef[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching resident information:', error)
    throw error
  }
}
