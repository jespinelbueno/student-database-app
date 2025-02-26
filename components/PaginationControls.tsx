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
  <div className="flex justify-center p-4 border-t border-zinc-700">
    <Button
      onClick={onPrevious}
      disabled={currentPage === 1}
      variant="secondary"
      className="mr-2"
    >
      Previous
    </Button>
    <span className="px-4 py-2 bg-zinc-700 text-zinc-100 rounded">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      onClick={onNext}
      disabled={currentPage === totalPages}
      variant="secondary"
      className="ml-2"
    >
      Next
    </Button>
  </div>
)
