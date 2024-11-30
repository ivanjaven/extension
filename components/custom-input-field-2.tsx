import React from 'react'
import { Input } from '@/components/ui/input'
import { initTypedef } from '@/lib/typedef/init-typedef'


export const CustomInputField: React.FC<{
  id: keyof initTypedef
  placeholder: string
  type: string
  cache: string
  handleChange: (id: keyof initTypedef, value: string) => void
}> = ({ id, placeholder, type, cache, handleChange }): JSX.Element => (
  <Input
    id={id}
    placeholder={placeholder}
    type={type}
    value={cache}
    onChange={(e) => handleChange(id, e.target.value)}
  />
)
