import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

type FormFields = 'occupation' | 'nationality' | 'religion' | 'benefits' | 'gender' | 'status' | 'street' | 'day' | 'month' | 'year'

interface CustomSelectFieldProps {
  fieldId: FormFields
  selectPlaceholder: string
  selectOptions: Array<Record<string, any>>
  cache: string
  handleChange: (id: FormFields, value: string) => void
}

export const CustomSelectField: React.FC<CustomSelectFieldProps> = ({
  fieldId,
  selectPlaceholder,
  selectOptions,
  cache,
  handleChange,
}) => {
  const [currentValue, setCurrentValue] = useState<string>(cache || '')

  useEffect(() => {
    setCurrentValue(cache || '')
  }, [cache])

  const handleValueChange = (value: string) => {
    setCurrentValue(value)
    handleChange(fieldId, value)
  } 

  return (
    <Select
      value={currentValue}
      onValueChange={handleValueChange}
      defaultValue={cache}
    >
      <SelectTrigger id={fieldId}>
        <SelectValue placeholder={selectPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {selectOptions?.map((option) => (
          <SelectItem key={option.id} value={option.id.toString()}>
            {option.type || option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
