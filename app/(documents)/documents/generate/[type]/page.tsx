'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import GenerateDocumentForm from '@/components/generate-document-form'
import { DOCUMENT_CONFIG } from '@/lib/config/DOCUMENT_CONFIG'
import { insertDocumentIssuanceRecord } from '@/server/actions/insert-document-issuance-record'
import { generateDocument } from '@/server/services/generate-document'
import {
  DocumentIssuanceTypedef,
  DocumentTitle,
} from '@/lib/typedef/document-issuance-typedef'
import { fetchUser } from '@/server/queries/fetch-user'
import ProgressBar from '@/components/ui/progress-bar'
import { useProgress } from '@/lib/hooks/useProgress'
import { toast } from 'sonner'
import { deleteQueueRecord } from '@/server/actions/delete-queue-record'
import { fetchUserReport } from '@/server/queries/fetch-user-report'
import { config } from 'process'
import { fetchStaff } from '@/server/queries/fetch-staff-data'
import { StaffInformationTypedef } from '@/lib/typedef/staff-information-typedef'

type DocumentType = keyof typeof DOCUMENT_CONFIG.document

type IdentifiedUser = {
  residentId: number
  fullName: string
  street: string
  imageBase64: string
} | null

type AssistanceTypes = {
  burial: string
  education: string
  medical: string
  financial: string
  others: string
}

export default function GenerateDocument() {
  const params = useParams()
  const type = params.type as string
  const [config, setConfig] = useState<
    (typeof DOCUMENT_CONFIG.document)[DocumentType] | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const { progress, updateProgress, resetProgress } = useProgress()
  const [identifiedUser, setIdentifiedUser] = useState<{
    residentId: number
    fullName: string
    imageBase64: string
    street_name: string
  } | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const searchParams = useSearchParams()
  const resident_id = searchParams.get('resident_id')
  const queue_id = searchParams.get('queue_id')
  const [staffInformation, setStaffInformation] =
    useState<StaffInformationTypedef | null>(null)

  useEffect(() => {
    if (type) {
      const configKey = type.replace(/-/g, '_').toLowerCase() as DocumentType
      const documentConfig = DOCUMENT_CONFIG.document[configKey]

      if (documentConfig) {
        setConfig(documentConfig)
      } else {
        console.error('No configuration found for document type:', configKey)
      }
    }
  }, [type])

  useEffect(() => {
    async function getStaffInfo() {
      try {
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Authentication failed')
        }
        const data = await response.json()

        // Fetch and set staff information
        const staffData = await fetchStaff(data.auth_id)
        if (staffData) {
          setStaffInformation(staffData)
        }
      } catch (error) {
        console.error('Staff validation error:', error)
        toast.error('Authentication failed')
      }
    }

    getStaffInfo()
  }, [])

  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket('ws://localhost:8080/fingerprint-ws')

      socketRef.current.onopen = () => {
        console.log('WebSocket connection established')
      }

      socketRef.current.onmessage = async (event) => {
        console.log('WebSocket message received:', event.data)
        const data = JSON.parse(event.data)
        if (data.status === 'success' && data.resident) {
          const user = await fetchUserReport(data.resident.residentId)
          const userInfo = user[0]
          setIdentifiedUser({
            residentId: data.resident.residentId,
            fullName: data.resident.fullName,
            imageBase64: userInfo.image_base64,
            street_name: userInfo.street_name,
          })
          setIsIdentifying(false)
          toast.success('User identified successfully')
        } else if (data.status === 'not_found') {
          setIsIdentifying(false)
          toast.error('No matching user found')
        } else {
          setIsIdentifying(false)
          toast.error(`Identification failed: ${data.message}`)
        }
      }

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsIdentifying(false)
      }

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect...')
        setTimeout(connectWebSocket, 3000)
      }
    }

    connectWebSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    // Auto-fill user information if resident_id is present
    const loadUserInfo = async () => {
      if (resident_id) {
        try {
          const user = await fetchUserReport(Number(resident_id))
          const userInfo = user[0]
          setIdentifiedUser({
            residentId: Number(resident_id),
            fullName: `${userInfo.first_name} ${userInfo.last_name}`,
            imageBase64: userInfo.image_base64,
            street_name: userInfo.street_name,
          })
        } catch (error) {
          console.error('Error loading user info:', error)
          toast.error('Failed to load user information')
        }
      }
    }

    loadUserInfo()
  }, [resident_id])

  const handleIdentify = () => {
    setIsIdentifying(true)
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending "identify" message to WebSocket')
      socketRef.current.send('identify')
    } else {
      console.log(
        'WebSocket not ready. Current state:',
        socketRef.current?.readyState,
      )
      setIsIdentifying(false)
      toast.error('Fingerprint scanner is connecting. Please try again.')
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    if (!config) {
      console.error('Configuration not loaded')
      return
    }
    if (!identifiedUser) {
      toast.error('Please identify the user first')
      return
    }
    if (!staffInformation) {
      toast.error('Staff authentication required')
      return
    }

    try {
      setIsLoading(true)
      resetProgress()
      updateProgress(10)

      // Add queue deletion if queue_id exists
      if (queue_id) {
        try {
          const deleteResult = await deleteQueueRecord(Number(queue_id))
          if (deleteResult.success) {
            console.log('Queue record deleted successfully')
          }
        } catch (error) {
          console.error('Failed to delete queue record:', error)
        }
      }

      // Get values from fields
      const priceField = config.fields.find(
        (field: { name: string }) => field.name.toLowerCase() === 'price',
      )
      const priceValue = priceField ? parseFloat(data[priceField.name]) : 0

      const businessNameField = config.fields.find(
        (field: { name: string }) =>
          field.name.toLowerCase() === 'business name',
      )
      const businessName = businessNameField ? data[businessNameField.name] : ''

      const reasonField = config.fields.find(
        (field: { name: string }) => field.name.toLowerCase() === 'reason',
      )
      const reason = reasonField ? data[reasonField.name] : ''

      const user = await fetchUserReport(identifiedUser.residentId)
      const userInfo = user[0]

      // Add the assistance type handling
      const assistanceType: AssistanceTypes = {
        burial: ' ',
        education: ' ',
        medical: ' ',
        financial: ' ',
        others: ' ',
      }

      // Set the selected purpose
      if (data.Purpose) {
        const key = data.Purpose.toLowerCase().replace(
          ' assistance',
          '',
        ) as keyof AssistanceTypes
        if (key in assistanceType) {
          assistanceType[key] = '/'
        }
      }

      const requiredData = {
        surname: userInfo.last_name,
        firstName: userInfo.first_name,
        middleName: userInfo.middle_name,
        price: priceValue,
        image: identifiedUser.imageBase64,
        purok: userInfo.street_name,
        businessName: businessName,
        template: config.path,
        reason: reason,
        Purpose: data.Purpose || '',
        ...assistanceType,
      }

      updateProgress(20)

      const documentData: DocumentIssuanceTypedef = {
        document_title: config.name as DocumentTitle,
        resident_id: identifiedUser.residentId,
        required_fields: data,
        issued_by: `${staffInformation.role} ${staffInformation.full_name}`,
        price: priceValue,
      }

      console.log('Submitting document data:', documentData)

      const result = await insertDocumentIssuanceRecord(documentData)
      console.log('Document issuance record inserted:', result)

      updateProgress(70)
      const blob = await generateDocument(requiredData)
      updateProgress(90)

      const url = window.URL.createObjectURL(blob)

      const popupWidth = 900
      const popupHeight = 800
      const left = (window.screen.width - popupWidth) / 2
      const top = (window.screen.height - popupHeight) / 2

      const pdfWindow = window.open(
        url,
        'Certificate of Residency',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`,
      )

      if (pdfWindow) {
        pdfWindow.addEventListener('load', () => {
          pdfWindow.print()
        })
      } else {
        alert('Please allow pop-ups to view and print the certificate.')
      }

      const smoothProgress = setInterval(() => {
        updateProgress((prev) => {
          if (prev >= 99) {
            clearInterval(smoothProgress)
            return 100
          }
          return prev + 1
        })
      }, 20)

      setTimeout(() => {
        clearInterval(smoothProgress)
        updateProgress(100)
        setIsLoading(false)
        alert('Document generated successfully!')
      }, 1000)
    } catch (error) {
      console.error('Error generating document:', error)
      setIsLoading(false)
      resetProgress()
      if (error instanceof Error) {
        alert(`Failed to generate document: ${error.message}`)
      } else {
        alert('Failed to generate document. Please try again.')
      }
    }
  }

  if (!config) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-20 mt-4 flex justify-center align-middle text-3xl font-bold">
        Generate {config.name}
      </h1>
      <GenerateDocumentForm
        fields={config.fields}
        document={config.name}
        onSubmit={handleSubmit}
        onIdentify={handleIdentify}
        isIdentifying={isIdentifying}
        identifiedUser={identifiedUser}
        setIdentifiedUser={setIdentifiedUser}
      />
      {isLoading && (
        <ProgressBar title={`Generating ${config.name}`} progress={progress} />
      )}
    </div>
  )
}
2
