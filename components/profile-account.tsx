'use client'

import { SetStateAction, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { StaffInformationTypedef } from '@/lib/typedef/staff-information-typedef'
import { fetchStaff } from '@/server/queries/fetch-staff-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { FingerprintIcon } from '@/lib/icons'
import { UserSearchIcon as ChangeUserIcon } from 'lucide-react'
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { toast } from 'sonner'
import { SearchSuggestionTypedef } from '@/lib/typedef/search-suggestion-typedef'
import { fetchSearchSuggestions } from '@/server/queries/fetch-search-suggestion'

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }),
  newPassword: z
    .string()
    .min(6, { message: 'New password must be at least 6 characters long' }),
})
type ProfileFormValue = z.infer<typeof formSchema>

const avatarSuggestions = [
  { name: 'John Doe', avatar: '/avatars/john-doe.jpg' },
  { name: 'Jane Smith', avatar: '/avatars/jane-smith.jpg' },
  { name: 'Alex Johnson', avatar: '/avatars/alex-johnson.jpg' },
]

export function ProfileAccountUser() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [showFingerprintDialog, setShowFingerprintDialog] = useState(false)
  const [showAvatarSearch, setShowAvatarSearch] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState('/placeholder-user.jpg')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [staffInformation, setStaffInformation] =
    useState<StaffInformationTypedef | null>(null)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<ProfileFormValue | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedUser, setSelectedUser] =
    useState<SearchSuggestionTypedef | null>(null)
  const [searchResults, setSearchResults] = useState<SearchSuggestionTypedef[]>(
    [],
  )
  const socketRef = useRef<WebSocket | null>(null)

  const form = useForm<ProfileFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: username,
      newPassword: '',
    },
  })

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      try {
        const results = await fetchSearchSuggestions(searchQuery)
        setSearchResults(results)
      } catch (error) {
        console.error('Error fetching search results:', error)
        toast.error('Failed to fetch search results')
      }
    }

    const timer = setTimeout(fetchResults, 150) // Reduced debounce time for more responsiveness
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (username) {
      form.setValue('username', username)
    }
  }, [username, form])

  useEffect(() => {
    async function validateSession() {
      try {
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Authentication failed')
        }

        const data = await response.json()

        const staffData = await fetchStaff(data.auth_id)
        if (staffData) {
          setStaffInformation(staffData)
          setSelectedAvatar(staffData.image_base64 || '/placeholder-user.jpg')
          setUsername(staffData.username || '')
        }
      } catch (error) {
        console.error('Session validation error:', error)
        router.push('/log-in')
      } finally {
        setIsLoading(false)
      }
    }

    validateSession()
  }, [router])

  const filteredAvatars = avatarSuggestions.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAvatarSelect = (avatar: SetStateAction<string>) => {
    setSelectedAvatar(avatar)
    setShowAvatarSearch(false)
  }

  const handleFormSubmit = async (data: ProfileFormValue) => {
    setFormData(data)
    setShowDialog(false)
    setShowFingerprintDialog(true)
  }

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const results = await fetchSearchSuggestions(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Error fetching search results:', error)
      toast.error('Failed to fetch search results')
    }
  }, [])

  // Add function to handle user selection
  const handleUserSelect = useCallback((user: SearchSuggestionTypedef) => {
    setSelectedUser(user)
    setSearchResults([])
  }, [])

  const handleChangeAdmin = async () => {
    if (!selectedUser || !staffInformation?.auth_id) return

    try {
      const response = await fetch('/api/users/change-admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentAuthId: staffInformation.auth_id,
          newResidentId: selectedUser.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to change admin')
      }

      toast.success('Admin access successfully transferred')
      router.push('/log-in')
    } catch (error) {
      console.error('Error changing admin:', error)
      toast.error('Failed to change admin access')
    }
  }

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/fingerprint-ws')

    socket.onopen = () => {
      console.log('WebSocket connected')
    }

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received WebSocket data:', data)
        setIsVerifying(false)

        if (data.status === 'success') {
          if (data.verified === true) {
            if (formData) {
              try {
                const response = await fetch('/api/users/update-profile', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    username: formData.username,
                    newPassword: formData.newPassword,
                    auth_id: staffInformation?.auth_id,
                  }),
                })

                const responseData = await response.json()

                if (!response.ok) {
                  throw new Error(
                    responseData.error || 'Failed to update profile',
                  )
                }

                // Update local state
                setUsername(formData.username)
                setShowFingerprintDialog(false)
                form.reset({
                  username: formData.username,
                  newPassword: '',
                })
                setFormData(null)
                toast.success('Changes applied successfully')
                router.push('/')
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : 'Failed to update profile',
                )
              }
            }
          } else {
            toast.error('Fingerprint does not match')
            setShowFingerprintDialog(false)
          }
        } else {
          toast.error(data.message || 'Verification failed')
          setShowFingerprintDialog(false)
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error)
        toast.error('Error processing response')
      }
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsVerifying(false)
    }

    socketRef.current = socket

    return () => {
      socket.close()
    }
  }, [formData, staffInformation?.auth_id, form, router])

  const handleVerifyFingerprint = async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Fingerprint scanner not connected')
      return
    }

    try {
      setIsVerifying(true)
      socketRef.current.send(
        JSON.stringify({
          verify: true,
          auth_id: staffInformation?.auth_id,
        }),
      )
    } catch (error) {
      toast.error('Failed to verify fingerprint')
      setIsVerifying(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!formData) return

    try {
      setError('')

      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          newPassword: formData.newPassword,
          auth_id: staffInformation?.auth_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setUsername(formData.username)
      setShowFingerprintDialog(false)
      form.reset({
        username: formData.username,
        newPassword: '',
      })
      setFormData(null)
      toast.success('Changes applied successfully')
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error(
        err instanceof Error ? err.message : 'Failed to update profile',
      )
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col text-black">
      <main className="flex flex-1 items-center justify-center">
        <div className="container mx-auto max-w-xl px-4 py-8">
          <div className="space-y-8">
            <div className="grid gap-6">
              <div className="relative flex flex-col items-center">
                <Avatar className="h-32 w-32 border border-black">
                  <AvatarImage
                    src={selectedAvatar}
                    alt={staffInformation?.full_name || 'User'}
                  />
                  <AvatarFallback>
                    {/* {staffInformation?.name?.[0] || 'U'} */}
                  </AvatarFallback>
                </Avatar>
                {staffInformation?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md"
                    onClick={() => setShowAvatarSearch(true)}
                  >
                    <ChangeUserIcon className="h-5 w-5" />
                  </Button>
                )}
                <div className="mt-3 text-sm font-medium text-gray-600">
                  {staffInformation?.role || 'Staff'}
                </div>
                <div className="text-3xl font-bold">
                  {staffInformation?.full_name || 'Loading...'}
                </div>
              </div>
              <Separator className="border-black" />
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    className="mt-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                    readOnly
                  />
                </div>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Button
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={() => setShowDialog(true)}
              >
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border border-black px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Update Profile
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter new username"
                        autoComplete="off"
                        autoFocus={false}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-black px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-black"
                    onClick={() => {
                      setShowDialog(false)
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    Confirm
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showFingerprintDialog}
        onOpenChange={setShowFingerprintDialog}
      >
        <DialogContent className="border border-black px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Fingerprint Validation
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Please scan your fingerprint to validate the changes.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleVerifyFingerprint}
              disabled={isVerifying}
              variant="outline"
              className="border border-black px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-black"
            >
              <FingerprintIcon className="mr-2 h-5 w-5" />
              {isVerifying ? 'Verifying...' : 'Scan Fingerprint'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 text-center text-sm text-red-600">{error}</div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="mt-4 border border-black px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-black"
              onClick={() => {
                setShowFingerprintDialog(false)
                setFormData(null)
                setError('')
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAvatarSearch} onOpenChange={setShowAvatarSearch}>
        <DialogContent className="w-full max-w-md border border-black bg-white p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-black">
              Change Admin User
            </DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Search and select a new admin user.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-gray-300"
            />
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user)
                      setSearchQuery(user.name)
                      setSearchResults([])
                    }}
                    className="flex cursor-pointer items-center space-x-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage
                        src={user.image}
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-100 font-medium text-black">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-black">
                      {user.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedUser && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-gray-600">Selected User:</p>
              <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={selectedUser.image}
                    alt={selectedUser.name}
                  />
                  <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{selectedUser.name}</span>
              </div>
              <Button
                onClick={handleChangeAdmin}
                className="mt-4 w-full bg-black text-white hover:bg-gray-800"
              >
                Change Admin Access
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
