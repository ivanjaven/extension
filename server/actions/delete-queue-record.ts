export async function deleteQueueRecord(queueId: number): Promise<any> {
  try {
    const response = await fetch('/api/queue', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queue_id: queueId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete queue record')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting queue record:', error)
    throw error
  }
}
