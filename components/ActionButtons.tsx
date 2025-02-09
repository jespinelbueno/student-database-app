import React from 'react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  selectedStudentsCount: number;
  onAdd: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownloadSelected: () => void;
  showQueryWizard: boolean;
  toggleQueryWizard: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedStudentsCount,
  onAdd,
  onSelectAll,
  onDeselectAll,
  onDownloadSelected,
  showQueryWizard,
  toggleQueryWizard,
}) => (
  <div className="flex justify-between items-center flex-wrap gap-3">
    <Button onClick={toggleQueryWizard} className="bg-zinc-500 hover:bg-zinc-700 text-zinc-100">
      {showQueryWizard ? 'Hide Query Wizard' : 'Show Query Wizard'}
    </Button>
    <div className="flex space-x-5">
      <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700">Add Student</Button>
      <Button onClick={onSelectAll} variant="secondary" className="bg-zinc-500 hover:bg-zinc-700">
        Select All
      </Button>
      <Button onClick={onDeselectAll} variant="secondary" className="bg-zinc-500 hover:bg-zinc-700">
        Deselect All
      </Button>
      <Button
        onClick={onDownloadSelected}
        disabled={selectedStudentsCount === 0}
        className="bg-emerald-600 hover:bg-emerald-700 text-zinc-100"
      >
        Download Selected ({selectedStudentsCount})
      </Button>
    </div>
  </div>
);
