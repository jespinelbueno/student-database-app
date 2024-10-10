import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => (
  <div className="pl-0 pr-0 mb-8">
    <Input
      type="text"
      placeholder="Quick search..."
      value={searchTerm}
      onChange={onSearchChange}
    />
  </div>
);
