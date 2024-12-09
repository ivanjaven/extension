import React, { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CameraIcon } from 'lucide-react'
import { toast } from 'sonner'
import * as faceapi from 'face-api.js'

export function FaceLogin() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectInterval = useRef<NodeJS.Timeout | null>(null)

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load multiple models for more robust detection
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.ageGenderNet.loadFromUri('/models')
        ])
        setIsModelsLoaded(true)
        toast.success('Face recognition models loaded successfully')
      } catch (error) {
        console.error('Failed to load face-api models:', error)
        toast.error('Failed to load face recognition models')
      }
    }

    loadModels()
  }, [])

  // Real-time face detection
  useEffect(() => {
    if (!isCameraOpen || !isModelsLoaded || photo) {
      // Stop detection if camera is closed, models are not loaded, or photo is taken
      if (detectInterval.current) {
        clearInterval(detectInterval.current)
      }
      return
    }

    const detectFaces = async () => {
      // Safely access video and canvas
      const video = webcamRef.current?.video
      const canvas = canvasRef.current

      if (video && canvas) {
        const displaySize = { width: video.videoWidth, height: video.videoHeight }
        
        // Resize canvas to match video
        canvas.width = displaySize.width
        canvas.height = displaySize.height
        faceapi.matchDimensions(canvas, displaySize)

        // Detect faces
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()

        // Clear previous drawings
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }

        // Draw detection results
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        if (resizedDetections.length > 0) {
          resizedDetections.forEach(detection => {
            const box = detection.detection.box
            if (ctx) {
              ctx.beginPath()
              ctx.rect(box.x, box.y, box.width, box.height)
              ctx.lineWidth = 2
              ctx.strokeStyle = 'green'
              ctx.stroke()
            }
          })
        }
      }
      // Explicitly return undefined for async function
      return Promise.resolve()
    }

    // Set up interval for continuous detection
    detectInterval.current = setInterval(() => {
      detectFaces().catch(console.error)
    }, 100)

    // Cleanup
    // eslint-disable-next-line consistent-return
    return () => {
      if (detectInterval.current) {
        clearInterval(detectInterval.current)
      }
    }
  }, [isCameraOpen, isModelsLoaded, photo])

  const handleOpenCamera = () => {
    setIsCameraOpen(true)
    setPhoto(null)
  }

  const handleCapturePhoto = useCallback(async () => {
    if (isProcessing) return
  
    setIsProcessing(true)
    
    try {
      const imageSrc = webcamRef.current?.getScreenshot({
        width: 1024,
        height: 1024,
      })
      
      if (imageSrc && isModelsLoaded) {
        // Create an image element for face detection
        const img = document.createElement('img')
        img.src = imageSrc
        
        await new Promise<void>((resolve) => {
          img.onload = async () => {
            try {
              // Perform face detection with multiple methods for better accuracy
              const detection = await faceapi
                .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor()
            
              if (detection) {

                const baseUrl = process.env.NEXT_PUBLIC_APP_URL
                const endpoint = '/api/auth/face-log-in'
              
                // Call the face login API
                const response = await fetch(`${baseUrl}${endpoint}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    face: Array.from(detection.descriptor)
                  })
                })
  
                const result = await response.json()
  
                if (response.ok) {
                  // Successful login
                  toast.success('Login successful')
                  window.location.href = '/'
                  console.log('Matched Resident ID:', result.residentId)
                  // Add any additional login logic here (e.g., redirecting)
                } else {
                  // Handle login failure
                  toast.error(result.error || 'Face recognition failed')
                }
  
                // Log additional face information
                // console.log('Face Detection:', {
                //   detection_params: detection.descriptor,
                //   confidence: detection.detection.score,
                // })
  
                setPhoto(imageSrc)
                setIsCameraOpen(false)
              } else {
                toast.error('No face detected. Please ensure good lighting and face the camera.')
              }
            } catch (error) {
              console.error('Face detection or login error:', error)
              toast.error('Login failed. Please try again.')
            } finally {
              resolve()
            }
          }
  
          img.onerror = () => {
            toast.error('Failed to load captured image')
            setIsCameraOpen(false)
            resolve()
          }
        })
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }, [webcamRef, isModelsLoaded, isProcessing])

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full">
      <div className="relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-4 border-gray-800 shadow-lg">
        {isCameraOpen ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="h-full w-full object-cover"
              videoConstraints={{
                width: 512,
                height: 512,
              }}
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </>
        ) : photo ? (
          <Image
            src={photo}
            alt="Captured Photo"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <CameraIcon className="h-16 w-16 text-gray-700" />
        )}
      </div>
      {isCameraOpen ? (
        <Button
          className="w-full max-w-xs text-lg font-semibold"
          size="lg"
          onClick={handleCapturePhoto}
          disabled={!isModelsLoaded || isProcessing}
        >
          <CameraIcon className="mr-2 h-6 w-6" />
          {isProcessing ? 'Processing...' : 'Login'}
        </Button>
      ) : (
        <Button
          className="w-full max-w-xs text-lg font-semibold"
          size="lg"
          onClick={handleOpenCamera}
        >
          <CameraIcon className="mr-2 h-6 w-6" />
          Open Camera
        </Button>
      )}
    </div>
  )
}