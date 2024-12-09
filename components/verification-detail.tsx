import React, { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RegistrationTypedef } from '@/lib/typedef/registration-typedef'
import { CameraIcon, Fingerprint } from 'lucide-react'
import { REGISTRATION_CONFIG } from '@/lib/config/REGISTRATION_CONFIG'
import { toast } from 'sonner'
import * as faceapi from 'face-api.js'

interface VerificationDetailProps {
  formData: RegistrationTypedef
  onFormDataChange: (id: keyof RegistrationTypedef, value: string) => void
}

export function VerificationDetail({
  formData,
  onFormDataChange,
}: VerificationDetailProps) {
  const [photo, setPhoto] = useState<string | null>(formData.image_base64 || null)
  const [fingerprintImage, setFingerprintImage] = useState<string | null>(formData.fingerprint_fmd || null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isCapturingFingerprint, setIsCapturingFingerprint] = useState(false)
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const detectInterval = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const webcamRef = useRef<Webcam>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
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

  const connectWebSocket = useCallback(() => {
    console.log('Attempting to connect WebSocket...')
    socketRef.current = new WebSocket('ws://localhost:8080/fingerprint-ws')

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established')
    }

    socketRef.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data)
      const data = JSON.parse(event.data)
      if (data.status === 'success') {
        const fingerprintDataUrl = `data:image/png;base64,${data.image}`
        setFingerprintImage(fingerprintDataUrl)
        onFormDataChange('fingerprint_fmd', data.fmd)
        setIsCapturingFingerprint(false)
        toast.success('Fingerprint captured successfully')
      } else {
        setIsCapturingFingerprint(false)
        toast.error(`Capture failed: ${data.message}`)
      }
    }

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsCapturingFingerprint(false)
    }

    socketRef.current.onclose = () => {
      console.log('Fingerprint connection failed. Attempting to reconnect...')
      setTimeout(connectWebSocket, 1000)
    }
  }, [onFormDataChange])

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [connectWebSocket])

  useEffect(() => {
    if (!isCameraOpen || !isModelsLoaded || photo) {
      if (detectInterval.current) {
        clearInterval(detectInterval.current)
      }
      return
    }

    const detectFaces = async () => {
      const video = webcamRef.current?.video
      const canvas = canvasRef.current

      if (video && canvas) {
        const displaySize = { width: video.videoWidth, height: video.videoHeight }
        canvas.width = displaySize.width
        canvas.height = displaySize.height
        faceapi.matchDimensions(canvas, displaySize)

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }

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
      return Promise.resolve()
    }

    detectInterval.current = setInterval(() => {
      detectFaces().catch(console.error)
    }, 100)

    // eslint-disable-next-line consistent-return
    return () => {
      if (detectInterval.current) {
        clearInterval(detectInterval.current)
      }
    }
  }, [isCameraOpen, isModelsLoaded, photo])

  const handleOpenCamera = () => {
    setIsCameraOpen(true)
  }

  const handleCapturePhoto = useCallback(async () => {
    setIsProcessing(true)

    try {
      const imageSrc = webcamRef.current?.getScreenshot({
        width: 1024,
        height: 1024,
      })
      if (imageSrc && isModelsLoaded) {
        const img = document.createElement('img')
        img.src = imageSrc
        
        await new Promise<void>((resolve) => {
          img.onload = async () => {
            try {
              if (canvasRef.current) {
                const canvas = canvasRef.current
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                
                if (ctx) {
                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                }
              }

              const detection = await faceapi
                .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor()
  

              if (detection) {
               

                console.log('Face Detection:', {
                  detection_params: detection.descriptor,
                  confidence: detection.detection.score,
          
                })
                
                setPhoto(imageSrc)
                setIsCameraOpen(false)
                onFormDataChange('face_descriptor', JSON.stringify(detection.descriptor))
                onFormDataChange('image_base64', imageSrc)
                toast.success('Face detected successfully')
              } else {
                toast.error('No face detected. Please try again.')
              }
            } catch (error) {
              console.error('Face detection error:', error)
              toast.error('Face detection failed')
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
  }, [webcamRef, onFormDataChange, isModelsLoaded])

  const handleCaptureFingerprint = useCallback(() => {
    setIsCapturingFingerprint(true)
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending "capture" message to WebSocket')
      socketRef.current.send('capture')
    } else {
      console.log(
        'WebSocket not ready. Current state:',
        socketRef.current?.readyState,
      )
      setIsCapturingFingerprint(false)
      toast.error('Fingerprint scanner is connecting. Please try again.')
    }
  }, [])

  const { facialPhoto, fingerprint } = REGISTRATION_CONFIG.verificationDetails

  return (
    <div className="mx-auto mt-16 max-w-6xl space-y-12 p-3 text-black">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{facialPhoto.title}</h2>
            <p className="text-base text-gray-800">{facialPhoto.subtitle}</p>
          </div>
          <div className="relative mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-4 border-gray-800 shadow-lg">
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
          <ul className="list-disc pl-6 text-base text-gray-800">
            {facialPhoto.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
          {isCameraOpen ? (
            <Button
              className="w-full text-lg font-semibold"
              size="lg"
              onClick={handleCapturePhoto}
              disabled={!isModelsLoaded}
            >
              <CameraIcon className="mr-2 h-6 w-6" />
              Capture Photo
            </Button>
          ) : (
            <Button
              className="w-full text-lg font-semibold"
              size="lg"
              onClick={handleOpenCamera}
            >
              <CameraIcon className="mr-2 h-6 w-6" />
              Open Camera
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{fingerprint.title}</h2>
            <p className="text-base text-gray-800">{fingerprint.subtitle}</p>
          </div>
          <div className="relative mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-4 border-gray-800 shadow-lg">
            {fingerprintImage ? (
              <Image
                src={fingerprintImage}
                alt="Captured Fingerprint"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <Fingerprint className="h-16 w-16 text-gray-700" />
            )}
          </div>
          <ul className="list-disc pl-6 text-base text-gray-800">
            {fingerprint.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
          <Button
            className="w-full text-lg font-semibold"
            size="lg"
            onClick={handleCaptureFingerprint}
            disabled={isCapturingFingerprint}
          >
            <Fingerprint className="mr-2 h-6 w-6" />
            {isCapturingFingerprint ? 'Capturing...' : 'Capture Fingerprint'}
          </Button>
        </div>
      </div>
    </div>
  )
}
