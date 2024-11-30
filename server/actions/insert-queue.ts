interface ResidentRequest {
    resident_id: number;
    document: string;
  }
  
  export async function insertQueue({ resident_id, document }: ResidentRequest): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const endpoint = '/api/queue/insert'
  
    // Construct the request body using the resident_id and document props
    const requestBody = {
      resident_id,
      document,
    }
  
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error posting registration data:', error)
      throw error
    }
  }
  