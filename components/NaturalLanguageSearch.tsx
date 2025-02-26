"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { NLQueryResult, QueryFilter } from '@/lib/students'
import { Search, Loader2, X } from 'lucide-react'

interface NaturalLanguageSearchProps {
  onSearchResults: (results: NLQueryResult) => void;
  onClose?: () => void;
}

export function NaturalLanguageSearch({ onSearchResults, onClose }: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [filters, setFilters] = useState<QueryFilter[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/ai/natural-language-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results: NLQueryResult = await response.json();
      setInterpretation(results.queryInterpretation);
      setFilters(results.filters);
      onSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-zinc-100">Natural Language Search</CardTitle>
          <br />
          <CardDescription className="text-zinc-400">
            Search using natural language (e.g., &quot;Show me promising students in California&quot;)
          </CardDescription>
          <br />
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your search query..."
            className="bg-zinc-900 border-zinc-700 text-zinc-100 h-10 w-full"
          />
        </div>

        {interpretation && (
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Query Interpretation</h3>
            <p className="text-zinc-100">{interpretation}</p>
            
            {filters.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Applied Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter, index) => (
                    <div
                      key={index}
                      className="bg-zinc-800 text-zinc-100 px-3 py-1.5 rounded-md text-sm flex items-center gap-2"
                    >
                      <span className="text-zinc-400">{filter.field}:</span>
                      <span>{filter.operation}</span>
                      <span className="text-emerald-500">{filter.value.toString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t border-zinc-700 pt-4">
        <Button 
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          variant="secondary"
          className="flex items-center gap-2"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </CardFooter>
    </Card>
  );
} 