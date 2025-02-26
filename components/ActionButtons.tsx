import React from 'react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  selectedStudentsCount: number;
  onAdd: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownloadSelected: () => void;
}

export function ActionButtons({
  selectedStudentsCount,
  onAdd,
  onSelectAll,
  onDeselectAll,
  onDownloadSelected,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
      <Button
        variant="success"
        onClick={onAdd}
        className="flex-1 sm:flex-none"
      >
        Add Student
      </Button>
      
      <Button 
        onClick={onSelectAll}
        variant="secondary"
        className="flex-1 sm:flex-none"
      >
        Select All
      </Button>
      
      <Button 
        onClick={onDeselectAll} 
        variant="secondary"
        className="flex-1 sm:flex-none"
      >
        Deselect All
      </Button>
      
      <Button
        onClick={onDownloadSelected}
        variant="success"
        className="flex-1 sm:flex-none"
        title={selectedStudentsCount > 0 
          ? `Download ${selectedStudentsCount} selected students` 
          : 'Download all students matching current filters'}
      >
        {selectedStudentsCount > 0 
          ? `Download (${selectedStudentsCount})` 
          : 'Download All'}
      </Button>
    </div>
  );
}
