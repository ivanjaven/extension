import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Camera } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Fingerprint } from 'lucide-react'
import { SearchDialog } from './search-dialog'
import { SearchSuggestionTypedef } from '@/lib/typedef/search-suggestion-typedef'
import { fetchUser } from '@/server/queries/fetch-user'
import { fetchUserReport } from '@/server/queries/fetch-user-report'
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from '@radix-ui/react-select'
import { CustomSelectField } from './custom-select-field-2'
import { SimpleDropdown } from './ui/simple-dropdown'

interface Field {
  name: string
  type: string
  label: string
  editable: boolean
  options?: string[]
}

interface GenerateDocumentFormProps {
  fields: Field[]
  onSubmit: (data: Record<string, any>) => void
  onIdentify: () => void
  isIdentifying: boolean
  identifiedUser: {
    street_name: string
    residentId: number
    fullName: string
    imageBase64: string
  } | null
  setIdentifiedUser: (
    user: {
      residentId: number
      fullName: string
      street_name: string
      imageBase64: string
    } | null,
  ) => void
  isLoading?: boolean
  document: string
}

const GenerateDocumentForm: React.FC<GenerateDocumentFormProps> = ({
  fields,
  onSubmit,
  onIdentify,
  isIdentifying,
  identifiedUser,
  setIdentifiedUser,
  isLoading = false,
  document,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [documentImage, setDocumentImage] = useState<string>('')
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch(`/assets/images/documents/${document}.jpg`)
        if (response.ok) {
          setDocumentImage(`/assets/images/documents/${document}.jpg`)
        } else {
          setDocumentImage('/assets/images/document.png')
        }
      } catch (error) {
        console.error('Error loading image:', error)
        setDocumentImage('/assets/images/document.png')
      }
    }

    loadImage()
  }, [document])

  useEffect(() => {
    if (identifiedUser) {
      setFormData((prev) => ({
        ...prev,
        'Full Name': identifiedUser.fullName,
        Street: identifiedUser.street_name,
      }))
    }
  }, [identifiedUser])

  // Add useEffect for the hotkey
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault()
        setIsSearchDialogOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked ? '/' : ' ',
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleUserSelect = async (suggestion: SearchSuggestionTypedef) => {
    try {
      const userData = await fetchUserReport(suggestion.id)
      if (userData && userData[0]) {
        const user = userData[0]
        setFormData((prev) => ({
          ...prev,
          'Full Name': suggestion.name,
          Price: formData['Price'] || '', // Preserve existing price if any
          Street: user.street_name,
        }))

        // If there's an imageBase64 field, update it
        if (user.image_base64) {
          const fakeIdentifiedUser = {
            residentId: suggestion.id,
            fullName: suggestion.name,
            street_name: user.street_name,
            imageBase64: user.image_base64,
          }
          // Update identifiedUser through props
          if (identifiedUser !== fakeIdentifiedUser) {
            setIdentifiedUser(fakeIdentifiedUser)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex">
        <div className="flex w-1/2 items-center justify-center p-4">
          <Skeleton className="h-[80vh] w-[80%]" />
        </div>
        <div className="w-1/2 space-y-4 p-4">
          <Skeleton className="mx-auto h-32 w-32 rounded-full" />
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col">
              <Skeleton className="mb-1 h-6 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="mx-auto h-10 w-40" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex">
        <div className="flex w-1/2 items-center justify-center p-4">
          <Image
            src={documentImage}
            alt="Document"
            width={400}
            height={600}
            objectFit="contain"
          />
        </div>
        <div className="w-1/2 p-4">
          <div className="mb-6 flex justify-center">
            <div className="relative h-32 w-32">
              {identifiedUser?.imageBase64 ? (
                <Image
                  src={identifiedUser.imageBase64}
                  alt="User"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200">
                  <Camera size={32} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col">
                <label
                  htmlFor={field.name}
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                {field.type === 'select' && field.options ? (
                  <SimpleDropdown
                    options={field.options}
                    placeholder={`Select ${field.label}`}
                    value={formData[field.name] || ''}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, [field.name]: value }))
                    }
                    disabled={!field.editable || !identifiedUser}
                  />
                ) : field.type === 'checkbox' && field.options ? (
                  <div className="space-y-2">
                    {field.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field.name}-${option}`}
                          checked={formData[option] === '/'}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(option, checked as boolean)
                          }
                          disabled={!identifiedUser}
                        />
                        <label
                          htmlFor={`${field.name}-${option}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder={`Enter ${field.name}`}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    disabled={!field.editable || !identifiedUser}
                    required
                    className="mb-4"
                  />
                )}
              </div>
            ))}
            <div className="mt-6 flex flex-row justify-center gap-6">
              <Button
                className="mt-12 rounded bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800"
                size="lg"
                onClick={onIdentify}
                disabled={isIdentifying}
              >
                <Fingerprint className="mr-2 h-6 w-6" />
                {isIdentifying ? 'Identifying...' : 'Identify User'}
              </Button>
              <Button
                size="lg"
                className="mt-12 rounded bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800"
                disabled={!identifiedUser}
              >
                Generate Document
              </Button>
            </div>
          </form>
        </div>
      </div>

      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        onSelect={handleUserSelect}
      />
    </>
  )
}

export default GenerateDocumentForm
