// SimpleDropdown.tsx
import React, { useState } from 'react'

interface SimpleDropdownProps {
  options: string[]
  placeholder: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SimpleDropdown({
  options,
  placeholder,
  value,
  onChange,
  disabled = false,
}: SimpleDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
