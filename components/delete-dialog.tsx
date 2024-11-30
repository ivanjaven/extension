import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { deleteResident } from '@/server/actions/delete-resident'
import { toast } from 'sonner'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  personId: number
  personName: string
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  personId,
  personName,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteResident(personId)
      
      toast.success('Record deleted successfully', {
        description: `Record #${personName} has been permanently removed.`,
        action: { label: 'Undo', onClick: () => console.log('Undo') },
      })
      
      onConfirm()
      onClose()
    } catch (error) {
      console.error('Error deleting person:', error)
      toast.error('Failed to delete record', {
        description: 'An error occurred while trying to delete the record. Please try again.',
        action: { label: 'Undo', onClick: () => console.log('Undo') },
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Are you sure you want to delete record #{personName}? This action cannot be undone
            and all associated data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? 'Deleting...' : 'Delete Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}