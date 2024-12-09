'use client'

import Link from 'next/link'
import { UserAuthForm } from '@/components/user-auth-form'
import Image from 'next/image'
import React, { useState } from 'react'
import { FaceLogin } from '@/components/facelogin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Wrapper Component for UserAuthForm
function UserAuthFormWrapper({ onSuccess }: { onSuccess: () => void }) {
  const handleFormSubmit = () => {
    console.log('Form submitted successfully!') // Example log for debugging
    onSuccess() // Trigger the success callback
  }

  return (
    <div className="space-y-4">
      {/* Render the original UserAuthForm */}
      <UserAuthForm />
      {/* Add a handler for the success event */}
      <Button 
        variant="outline"
        onClick={handleFormSubmit} 
        className="w-full"
      >
        Face Login
      </Button>
    </div>
  )
}

export default function AuthenticationPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 2))
  }

  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Use the wrapper component */}
              <UserAuthFormWrapper onSuccess={nextStep} />
              
              <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{' '}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Face Authentication</CardTitle>
              <CardDescription>
                Complete your login using facial recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <FaceLogin />
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/logo.png"
              alt="Sauyo Logo"
              width={64}
              height={64}
              className="mr-2"
            />
            <span className="text-2xl font-bold">Sauyo</span>
          </div>
        </div>
        <div className="relative z-20 mt-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome to Sauyo Portal
            </h2>
            <p className="text-lg text-gray-300">
              Your secure gateway to efficient and reliable public administration services.
            </p>
          </div>
          <blockquote className="mt-8 space-y-2">
            <p className="text-lg italic text-gray-300">
              &ldquo;Secure access to government services and resources. Your
              gateway to efficient and reliable public administration.&rdquo;
            </p>
            <footer className="text-sm font-medium text-gray-400">
              Department of Digital Services
            </footer>
          </blockquote>
        </div>
      </div>
      
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="w-full">
          {renderStep()}
          
          {currentStep === 2 && (
            <div className="flex justify-center mt-6 space-x-4 max-w-md mx-auto">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                className="w-full"
              >
                Previous
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}