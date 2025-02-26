import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { NaturalLanguageSearch } from '@/components/NaturalLanguageSearch';
import { PostgreSQLQuery } from '@/components/PostgreSQLQuery';
import QueryWizard from '@/components/queryWizard/QueryWizard';
import { ColumnVisibility } from '@/types/interfaces';
import { NLQueryResult, Student } from '@/lib/students';
import { QueryCondition } from '@/types/interfaces';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Wand2, Database, Filter } from 'lucide-react';

interface UnifiedSearchProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAISearchResults: (results: NLQueryResult) => void;
  onApplyQuery: (conditions: QueryCondition[]) => void;
  onUpdateColumnVisibility: (visibility: ColumnVisibility) => void;
  onSQLQueryResults?: (results: Student[]) => void;
  initialColumnVisibility: ColumnVisibility;
}

export function UnifiedSearch({
  searchTerm,
  onSearchChange,
  onAISearchResults,
  onApplyQuery,
  onUpdateColumnVisibility,
  onSQLQueryResults,
  initialColumnVisibility,
}: UnifiedSearchProps) {
  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">Search & Queries</CardTitle>
        <CardDescription className="text-zinc-400">
          Find and filter students using different search methods
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-zinc-800 rounded-lg gap-1">
            <TabsTrigger 
              value="quick" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Search</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">AI Search</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sql" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">SQL Query</span>
              <span className="sm:hidden">SQL</span>
            </TabsTrigger>
            <TabsTrigger 
              value="advanced" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
              <span className="sm:hidden">Filter</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {/* Quick Search */}
            <TabsContent value="quick">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
              />
            </TabsContent>

            {/* AI Search */}
            <TabsContent value="ai">
              <NaturalLanguageSearch
                onSearchResults={onAISearchResults}
              />
            </TabsContent>

            {/* SQL Query - Always display the component */}
            <TabsContent value="sql">
              <PostgreSQLQuery 
                onQueryResults={onSQLQueryResults}
              />
            </TabsContent>

            {/* Advanced Query Wizard */}
            <TabsContent value="advanced">
              <QueryWizard
                onApplyQuery={onApplyQuery}
                onUpdateColumnVisibility={onUpdateColumnVisibility}
                initialColumnVisibility={initialColumnVisibility}
                onClose={() => {}}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 