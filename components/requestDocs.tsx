'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { DOCUMENT_CONFIG } from '@/lib/config/DOCUMENT_CONFIG'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { insertQueue } from '@/server/actions/insert-queue'  // Import the insertQueue action
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const documents = DOCUMENT_CONFIG

interface RequestDocsProps {
  resident_id: number
}

export function RequestDocs({ resident_id }: RequestDocsProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showNextStepsDialog, setShowNextStepsDialog] = useState(false)
  const router = useRouter()

  const handleDocumentClick = (docName: string) => {
    setSelectedDoc(docName)
    setShowConfirmDialog(true)
  }

  const handleConfirmRequest = async () => {
    if (selectedDoc) {
      // Insert the document request into the queue
      try {
        const result = await insertQueue({ resident_id, document: selectedDoc })
        console.log('Document added to queue:', result)
        setShowConfirmDialog(false)
        setShowNextStepsDialog(true)
      } catch (error) {
        console.error('Error inserting document into queue:', error)
      }
    }
  }

  const handleNextStepsConfirm = () => {
    console.log(`Document confirmed - Resident ID: ${resident_id}, Document: ${selectedDoc}`)
    handleLogout()
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/log-out', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      router.push('/log-in')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <main className="w-full bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-blue-100 to-blue-50 opacity-30" />
        </div>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:py-12 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
              <span className="block">Request Official</span>
              <span className="block text-blue-600">Documents</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.documentType.map((doc) => (
            <Card 
              key={doc.name}
              className="transform cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
              onClick={() => handleDocumentClick(doc.name)}
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6 h-40 w-40 sm:h-48 sm:w-48">
                    <div className="absolute -inset-1 rounded-full bg-blue-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    <Image
                      src={doc.icon}
                      alt={doc.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="relative z-10"
                    />
                  </div>
                  <h3 className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
                    {doc.name}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Improved Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-xl w-11/12 p-6 sm:p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
              Confirm Your Request
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-lg sm:text-xl text-gray-700 text-center">
                You’re about to request: <span className="font-semibold text-blue-600">{selectedDoc}</span>
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-base sm:text-lg text-gray-600">
                  By proceeding, you will:
                </p>
                <ul className="list-disc ml-6 mt-2 text-base sm:text-lg text-gray-600">
                  <li>Initiate the official document request process</li>
                  <li>Your document will be placed in the queue</li>
                  <li>The staff will print your document</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
            <AlertDialogCancel className="w-full sm:w-auto rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              Cancel Request
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRequest}
              className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Confirm Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Improved Next Steps Dialog */}
      <AlertDialog open={showNextStepsDialog} onOpenChange={setShowNextStepsDialog}>
        <AlertDialogContent className="max-w-xl w-11/12 p-6 sm:p-8">
          <AlertDialogHeader>
            <div className="mx-auto mb-6 h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <AlertDialogTitle className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
              Request Successfully Initiated
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-lg sm:text-xl text-gray-700 text-center">
                Your request for <span className="font-semibold text-blue-600">{selectedDoc}</span> has been successfully initiated.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                  Next Steps:
                </p>
                <ul className="list-disc ml-6 text-base sm:text-lg text-gray-600 space-y-2">
                  <li>Please wait for the barangay staff to provide you with further instructions</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogAction
              onClick={handleNextStepsConfirm}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
