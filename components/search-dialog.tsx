import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { SearchSuggestionTypedef } from '@/lib/typedef/search-suggestion-typedef'
import { fetchSearchSuggestions } from '@/server/queries/fetch-search-suggestion'
import { Search } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (suggestion: SearchSuggestionTypedef) => void
}

export function SearchDialog({ isOpen, onClose, onSelect }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestionTypedef[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const results = await fetchSearchSuggestions(searchQuery)
        setSuggestions(results)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gap-2 p-1 outline-none">
        <div className="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white px-4 py-2">
          <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
          <Input
            placeholder="Type a name to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 border-0 bg-transparent p-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-0"
            autoComplete="off"
            autoFocus
          />
        </div>
        <ScrollArea className="max-h-[300px] min-h-[200px] overflow-y-auto">
          <Command>
            <CommandEmpty className="py-6 text-center text-sm">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  <span>Searching...</span>
                </div>
              ) : searchQuery.length > 0 ? (
                'No results found.'
              ) : (
                'Enter a name to search...'
              )}
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion.id}
                  onSelect={() => {
                    onSelect(suggestion)
                    onClose()
                  }}
                  className="px-4 py-3 transition-colors hover:cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={suggestion.image}
                        alt={suggestion.name}
                      />
                      <AvatarFallback className="bg-gray-100 text-sm">
                        {suggestion.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {suggestion.name}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
