import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => (
  <div className="flex gap-2">
    <div className="flex-1 relative">
      <Input
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Type to search..."
        className="bg-zinc-900 border-zinc-700 text-zinc-100 pr-8"
      />
      <Search className="h-4 w-4 absolute right-3 top-3 text-zinc-400" />
    </div>
  </div>
);
