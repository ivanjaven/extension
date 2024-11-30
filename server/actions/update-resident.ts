import { initTypedef } from '@/lib/typedef/init-typedef'

export async function updateResident(data: initTypedef): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = '/api/resident/update'

  try {
    const requestBody = {
      resident_id: data.resident_id,
      address_id: data.address_id,
      contact_id: data.contact_id,
      full_name: `${data.name} ${data.middlename} ${data.surname}`,
      first_name: data.name,
      last_name: data.surname,
      middle_name: data.middlename || 'N/A',
      gender: data.gender,
      date_of_birth: `${data.year}-${data.month}-${data.day}`,
      civil_status: data.status,
      house_number: data.houseNumber,
      street_id: data.street,
      email: data.email || 'N/A',
      mobile: data.mobile || 'N/A',
      occupation_id: data.occupation,
      nationality_id: data.nationality,
      religion_id: data.religion,
      benefit_id: data.benefits,
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
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
