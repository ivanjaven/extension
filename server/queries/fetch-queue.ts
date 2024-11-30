import { queueTypedef } from '@/lib/typedef/queue-typedef'

export async function fetchQueue(
  page: number = 1,
  limit: number = 5,
  ): Promise<{ data: queueTypedef[] }> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
     const endpoint = '/api/queue/fetch'
  

     try {
      const url = `${baseUrl}${endpoint}?page=${page}&limit=${limit}`
      console.log('Fetching from URL:', url)
  
      const response = await fetch(url)
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        )
      }
  
      const data = await response.json()
      console.log('Received data:', data)
      return data
    } catch (error) {
      console.error('Error fetching document logs:', error)
      throw error
    }
  }
  