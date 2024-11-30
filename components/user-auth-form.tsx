'use client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { FingerprintIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
})

type UserFormValue = z.infer<typeof formSchema>

export function UserAuthForm() {
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(60)
  const [loading, setLoading] = useState(false)
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false)
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const router = useRouter()
  const socketRef = useRef<WebSocket | null>(null)

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
  })

  // Handle WebSocket connection
  const connectWebSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8080/fingerprint-ws')

    socketRef.current.onopen = () => {
      console.log('WebSocket connected')
      setIsWebSocketConnected(true)
    }

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected')
      setIsWebSocketConnected(false)
      // Try to reconnect after a delay
      setTimeout(connectWebSocket, 3000)
    }

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsWebSocketConnected(false)
    }

    socketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      console.log('Received WebSocket data:', data)

      if (data.status === 'success' && data.resident) {
        try {
          // Send exactly the data needed by the API
          console.log('Sending the data to api...')
          const response = await fetch('/api/auth/fingerprint-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: data.resident.username,
              authId: data.resident.authId,
              role: data.resident.role,
            }),
          })

          const responseData = await response.json()

          if (response.ok) {
            // Handle success exactly like traditional login
            // The token cookie is automatically set by the response
            Cookies.set('token', responseData.token) // Set token from response
            router.push('/')
          } else {
            console.error('Login failed:', responseData)
            toast.error(responseData.error || 'Login failed')
          }
        } catch (error) {
          console.error('Login error:', error)
          toast.error('Login failed')
        }
      } else if (data.status === 'not_found') {
        toast.error('No matching user found')
      } else {
        toast.error(data.message || 'Scan failed')
      }
      setIsFingerprintScanning(false)
    }
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => prev - 1)
      }, 1000)
    } else if (lockTimer === 0) {
      setIsLocked(false)
      setAttempts(0)
      setLockTimer(60)
    }
    return () => clearInterval(interval)
  }, [isLocked, lockTimer])

  const onSubmit = async (data: UserFormValue) => {
    if (isLocked) {
      toast.error(`Account locked. Try again in ${lockTimer} seconds`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/log-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const { token } = await response.json()
        Cookies.set('token', token)
        router.push('/')
      } else {
        setAttempts((prev) => prev + 1)
        if (attempts + 1 >= 10) {
          setIsLocked(true)
          toast.error('Too many failed attempts. Account locked for 60 seconds')
        } else {
          toast.error('Invalid username or password')
        }
      }
    } catch (error) {
      console.error('Error logging in:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFingerprintLogin = () => {
    if (!isWebSocketConnected) {
      toast.error('Fingerprint scanner not connected')
      return
    }

    setIsFingerprintScanning(true)
    socketRef.current?.send('identify')
  }

  const handleStaffFingerprintLogin = () => {
    if (!isWebSocketConnected) {
      toast.error('Fingerprint scanner not connected')
      return
    }

    setIsFingerprintScanning(true)
    socketRef.current?.send('identify_staff')
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="ml-auto w-full" type="submit">
            {loading ? 'Loading...' : 'Login'}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {/* <Button
          variant="outline"
          onClick={handleFingerprintLogin}
          disabled={isFingerprintScanning || !isWebSocketConnected}
          className="w-full"
        >
          <FingerprintIcon className="mr-2 h-5 w-5" />
          {isFingerprintScanning
            ? 'Scanning...'
            : !isWebSocketConnected
            ? 'Scanner not connected'
            : 'Resident Fingerprint Login'}
        </Button> */}

        <Button
          variant="outline"
          onClick={handleStaffFingerprintLogin}
          disabled={isFingerprintScanning || !isWebSocketConnected}
          className="border border-black px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-black"
        >
          <FingerprintIcon className="mr-2 h-5 w-5" />
          {isFingerprintScanning
            ? 'Scanning...'
            : !isWebSocketConnected
              ? 'Scanner not connected'
              : 'Fingerprint Log In'}
        </Button>
      </div>
    </>
  )
}
