export async function deleteResident(residentId: number): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const endpoint = '/api/resident/delete'
  
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resident_id: residentId }),
      })
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', response.status, errorText)
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        )
      }
  
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error deleting resident:', error)
      throw error
    }
  }