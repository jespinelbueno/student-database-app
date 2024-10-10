// components/PaginationControls.tsx
import React from 'react'
import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) => (
  <div className="flex justify-center p-4 border-t">
    <Button
      onClick={onPrevious}
      disabled={currentPage === 1}
      variant="outline"
      className="mr-2"
    >
      Previous
    </Button>
    <span className="px-4 py-2 bg-gray-100 rounded">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      onClick={onNext}
      disabled={currentPage === totalPages}
      variant="outline"
      className="ml-2"
    >
      Next
    </Button>
  </div>
)
