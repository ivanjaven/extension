'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { fetchInit } from '@/server/queries/fetch-init'
import { initTypedef } from '@/lib/typedef/init-typedef'
import { MetadataTypedef } from '@/lib/typedef/metadata-typedef'
import { fetchMetadata } from '@/server/queries/fetch-metadata'
import { CustomInputField } from '@/components/custom-input-field-2'
import { CustomSelectField } from '@/components/custom-select-field-2'
import { capitalize } from '@/lib/utils'
import { REGISTRATION_CONFIG } from '@/lib/config/REGISTRATION_CONFIG'
import { CustomFormField } from './custom-form-field'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, Loader2, Save, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { updateResident } from '@/server/actions/update-resident'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

export type FormFields = keyof initTypedef

interface EditSheetProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly query: number;
}

const initialMetadata: Readonly<MetadataTypedef> = {
  benefits: [],
  occupation: [],
  street: [],
  nationality: [],
  religion: [],
}

interface FormError {
  field: FormFields;
  message: string;
}

export function EditSheet({ isOpen, onClose, query }: EditSheetProps): JSX.Element {
  const [metadata, setMetadata] = useState<MetadataTypedef>(initialMetadata)
  const [formData, setFormData] = useState<initTypedef | undefined>()
  const [originalData, setOriginalData] = useState<initTypedef | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormError[]>([])

  useEffect(() => {
    const fetchAllData = async (): Promise<void> => {
      if (!isOpen || !query) return
      
      setIsLoading(true)
      setError(null)
      try {
        const [metadataData, initData] = await Promise.all([
          fetchMetadata(),
          fetchInit(query),
        ])

        if (!initData?.[0]) {
          throw new Error('No resident data found')
        }

        setMetadata(metadataData)

        const dateStr = initData[0].date_of_birth
        const [year, month, day] = dateStr.split('-').map(num => num.padStart(2, '0'))
        
        const initialFormData: initTypedef = {
          ...initData[0],
          date_of_birth: new Date(dateStr).toISOString().split('T')[0],
          occupation: String(initData[0].occupation ?? ''),
          nationality: String(initData[0].nationality ?? ''),
          religion: String(initData[0].religion ?? ''),
          benefits: String(initData[0].benefits ?? ''),
          archive: String(initData[0].archive ?? '0'),
          street: String(initData[0].street ?? ''),
          day,
          month,
          year,
          age: initData[0].age,
          age_category: initData[0].age_category,
          resident_id: String(initData[0].resident_id),      
          name: initData[0].name,
          surname: initData[0].surname,
          middlename: initData[0].middlename,
          gender: String(initData[0].gender ?? ''),
          image_base64: initData[0].image_base64,
          status: String(initData[0].status ?? ''),
          houseNumber: initData[0].houseNumber,
          contact_id: initData[0].contact_id ?? '',       
          email: initData[0].email ?? '',                   
          mobile: initData[0].mobile ?? '',                  
        }

        setFormData(initialFormData)
        setOriginalData(initialFormData)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resident data'
        setError(errorMessage)
        toast.error('Error', {
          description: errorMessage,
          action: { label: 'Undo', onClick: () => console.log('Undo') },
        })
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAllData()
  }, [isOpen, query])

  const validateForm = useCallback((): FormError[] => {
    const errors: FormError[] = []
    
    if (!formData) return errors

    // Required fields validation
    if (!formData.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' })
    }
    if (!formData.surname?.trim()) {
      errors.push({ field: 'surname', message: 'Surname is required' })
    }
    if (!formData.gender) {
      errors.push({ field: 'gender', message: 'Gender is required' })
    }
    
    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' })
    }
    
    // Mobile number validation if provided
    if (formData.mobile && !/^\+?[\d\s-]{10,}$/.test(formData.mobile)) {
      errors.push({ field: 'mobile', message: 'Invalid mobile number format' })
    }

    return errors
  }, [formData])

  const hasChanges = useCallback((): boolean => {
    if (!formData || !originalData) return false
    
    return Object.keys(formData).some(key => {
      const field = key as keyof initTypedef
      return formData[field] !== originalData[field]
    })
  }, [formData, originalData])

  const onFormDataChange = useCallback((fieldId: FormFields, value: string): void => {
    setFormData((prevData) => {
      if (!prevData) return prevData
      return {
        ...prevData,
        [fieldId]: value
      }
    })
    // Clear any previous errors for this field
    setFormErrors(prev => prev.filter(error => error.field !== fieldId))
  }, [])

  const handleSave = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setFormErrors(errors)
      toast.error('Validation Error', {
        description: 'Please correct the highlighted fields',
        action: { label: 'Undo', onClick: () => console.log('Undo') },
      })
      return
    }
  
    if (!formData) return
  
    setIsSaving(true)
    try {
      console.log(formData)
      await updateResident(formData)
      setOriginalData(formData) // Update original data after successful save
      toast.success('Success', {
        description: 'Resident data updated successfully',
        action: { label: 'Undo', onClick: () => console.log('Undo') },
      })
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update resident'
      toast.error('Error', {
        description: errorMessage,
        action: { label: 'Undo', onClick: () => console.log('Undo') },
      })
    } finally {
      setIsSaving(false)
    }
  }

  const nameFields: readonly (keyof Pick<initTypedef, 'surname' | 'name' | 'middlename'>)[] = 
    ['surname', 'name', 'middlename'] as const

  const contactFields: readonly (keyof Pick<initTypedef, 'email' | 'mobile'>)[] = 
    ['email', 'mobile'] as const

  if (isLoading || !formData) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[640px]">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-semibold">Edit Record</SheetTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading resident data...</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  if (error) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[640px]">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-semibold">Edit Record</SheetTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
          </SheetHeader>
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[640px] p-0">
        <SheetHeader className="p-6 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-semibold">Edit Record</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-6">
          <div className="space-y-8 py-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {nameFields.map((field) => (
                    <CustomFormField 
                      key={field} 
                      label={capitalize(field)}
                    >
                      <CustomInputField
                        id={field}
                        placeholder={`Enter ${field}`}
                        type="text"
                        cache={formData[field]}
                        handleChange={onFormDataChange}
                      />
                    </CustomFormField>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <CustomFormField label="Birthday">
                    <div className="grid grid-cols-3 gap-4">
                      <CustomSelectField
                        fieldId="day"
                        selectPlaceholder="Day"
                        selectOptions={REGISTRATION_CONFIG.dropdownOptions.day}
                        cache={formData.day}
                        handleChange={onFormDataChange}
                      />
                      <CustomSelectField
                        fieldId="month"
                        selectPlaceholder="Month"
                        selectOptions={REGISTRATION_CONFIG.dropdownOptions.month}
                        cache={formData.month}
                        handleChange={onFormDataChange}
                      />
                      <CustomSelectField
                        fieldId="year"
                        selectPlaceholder="Year"
                        selectOptions={REGISTRATION_CONFIG.dropdownOptions.year}
                        cache={formData.year}
                        handleChange={onFormDataChange}
                      />
                    </div>
                  </CustomFormField>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomFormField 
                      label="Gender"
                    >
                      <CustomSelectField
                        fieldId="gender"
                        selectPlaceholder="Select Gender"
                        selectOptions={REGISTRATION_CONFIG.dropdownOptions.gender}
                        cache={formData.gender}
                        handleChange={onFormDataChange}
                      />
                    </CustomFormField>
                    <CustomFormField label="Status">
                      <CustomSelectField
                        fieldId="status"
                        selectPlaceholder="Select Status"
                        selectOptions={REGISTRATION_CONFIG.dropdownOptions.status}
                        cache={formData.status}
                        handleChange={onFormDataChange}
                      />
                    </CustomFormField>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <CustomFormField label="Street">
                    <CustomSelectField
                      fieldId="street"
                      selectPlaceholder="Select Street"
                      selectOptions={metadata.street}
                      cache={formData.street}
                      handleChange={onFormDataChange}
                    />
                  </CustomFormField>
                  <CustomFormField label="House Number">
                    <CustomInputField
                      id="houseNumber"
                      placeholder="Enter house number"
                      type="text"
                      cache={formData.houseNumber}
                      handleChange={onFormDataChange}
                    />
                  </CustomFormField>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {contactFields.map((field) => (
                    <CustomFormField 
                      key={field} 
                      label={capitalize(field)}
                    >
                      <CustomInputField
                        id={field}
                        placeholder={`Enter ${field}`}
                        type={field === 'email' ? 'email' : 'text'}
                        cache={formData[field]}
                        handleChange={onFormDataChange}
                      />
                    </CustomFormField>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {(['occupation', 'nationality', 'religion', 'benefits'] as const).map((field) => (
                  <CustomFormField 
                    key={field} 
                    label={capitalize(field)}
                  >
                    <CustomSelectField
                      fieldId={field}
                      selectPlaceholder={`Select ${field}`}
                      selectOptions={metadata[field]}
                      cache={formData[field]}
                      handleChange={onFormDataChange}
                    />
                  </CustomFormField>
                ))}
              </div>
            </Card>
          </div>
        </ScrollArea>

        <SheetFooter className="sticky bottom-0 w-full p-6 bg-background border-t">
          <div className="flex w-full gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary"
              onClick={handleSave}
              disabled={isSaving || formErrors.length > 0 || !hasChanges()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}