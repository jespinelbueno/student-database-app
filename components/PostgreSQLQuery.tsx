"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Database, Copy, Download, Info, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from "../components/ui/alert"
import { Student } from '@/lib/students'
import { DatabaseTableInfo } from './DatabaseTableInfo'

interface PostgreSQLQueryProps {
  onClose?: () => void;
  onQueryResults?: (results: Student[]) => void;
}

interface QueryResult {
  [key: string]: string | number | boolean | null | Date;
}

export function PostgreSQLQuery({ onClose, onQueryResults }: PostgreSQLQueryProps) {
  const [query, setQuery] = useState<string>('SELECT * FROM students LIMIT 10');
  const [results, setResults] = useState<QueryResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSchemaInfo, setShowSchemaInfo] = useState<boolean>(false);
  const [isAggregateQuery, setIsAggregateQuery] = useState<boolean>(false);

  // Common button styles
  const smallButtonClass = "h-8 text-xs flex items-center gap-1";

  const executeQuery = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    setIsAggregateQuery(false);
    
    try {
      // Check if this is likely an aggregate query (e.g., GROUP BY, COUNT)
      const queryLower = query.toLowerCase();
      const isAggregate = queryLower.includes('count(') || 
                         queryLower.includes('group by') || 
                         queryLower.includes('sum(') || 
                         queryLower.includes('avg(');
      
      setIsAggregateQuery(isAggregate);

      const response = await fetch('/api/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Failed to execute query';
        
        // Provide more helpful error messages
        if (errorMessage.includes('BigInt')) {
          errorMessage = "Error: Cannot process COUNT(*) results. This has been fixed - please try your query again.";
        } else if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
          errorMessage += "\n\nThere might be an issue with the table name. Try using 'students' as the table name.";
        } else if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
          errorMessage += "\n\nThere might be an issue with a column name. Please check the schema reference.";
        }
        
        throw new Error(errorMessage);
      }

      if (!data.result || !data.result.length) {
        setResults([]);
        setSuccessMessage('Query executed successfully. 0 rows returned.');
        if (onQueryResults && !isAggregate) {
          onQueryResults([]);
        }
        return;
      }
      
      // Store raw results for display
      setResults(data.result);
      
      // If this is not an aggregate query, map the results to Student objects for the parent component
      if (!isAggregate && onQueryResults) {
        // Map the raw results to Student type with improved field handling
        const mappedResults = data.result.map((row: QueryResult) => {
          // The API now returns both formats, but we'll still have fallbacks just to be safe
          return {
            id: Number(row.id || 0),
            firstName: String(row.firstName || row.first_name || ''),
            lastName: String(row.lastName || row.last_name || ''),
            email: String(row.email || ''),
            graduationYear: Number(row.graduationYear || row.graduation_year || 0),
            phoneNumber: row.phoneNumber || row.phone_number || null,
            promisingStudent: Boolean(row.promisingStudent || row.promising_student || false),
            schoolOrg: String(row.schoolOrg || row.school_org || ''),
            address: row.address || null,
            city: row.city || null,
            state: row.state || null,
            zipCode: row.zipCode || row.zip_code || null,
            createdAt: row.createdAt instanceof Date ? row.createdAt : 
                      row.created_at instanceof Date ? row.created_at : new Date(),
            updatedAt: row.updatedAt instanceof Date ? row.updatedAt : 
                      row.updated_at instanceof Date ? row.updated_at : new Date()
          };
        });
        
        onQueryResults(mappedResults);
      }
      
      setSuccessMessage(`Query executed successfully. ${data.result.length} rows returned.`);
    } catch (err: unknown) {
      console.error('Error executing query:', err);
      setError((err as Error)?.message || 'An error occurred while executing the query');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!results) return;
    
    try {
      const jsonString = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(jsonString);
      setSuccessMessage('Results copied to clipboard');
    } catch (_err) {
      setError('Failed to copy results to clipboard');
    }
  };

  const downloadResults = () => {
    if (!results) return;
    
    try {
      const jsonString = JSON.stringify(results, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'query-results.json';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Results downloaded as JSON');
    } catch (_err) {
      setError('Failed to download results');
    }
  };

  // Quick template queries
  const queryTemplates = [
    { name: 'All students', query: 'SELECT * FROM students' },
    { name: 'Promising students', query: 'SELECT firstName, lastName, email FROM students WHERE promisingStudent = true' },
    { name: 'Students by state', query: 'SELECT state, COUNT(*) as count FROM students GROUP BY state ORDER BY count DESC' },
    { name: 'Future graduates', query: 'SELECT * FROM students WHERE graduationYear > 2023 ORDER BY graduationYear' },
  ];

  const applyTemplate = (templateQuery: string) => {
    setQuery(templateQuery);
  };

  return (
    <>
      <Card className="w-full bg-zinc-800 border-zinc-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Database className="h-5 w-5" />
              PostgreSQL Query
            </CardTitle>
            
            <Button 
              variant="outline" 
              size="sm" 
              className={smallButtonClass}
              onClick={() => setShowSchemaInfo(!showSchemaInfo)}
            >
              <Info className="h-3 w-3 mr-1" />
              Schema Reference
              {showSchemaInfo ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>
          <CardDescription className="text-zinc-400">
            Execute read-only SQL queries against the database (SELECT queries only)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {queryTemplates.map((template, index) => (
              <Button 
                key={index}
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => applyTemplate(template.query)}
              >
                {template.name}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here... (e.g., SELECT * FROM students LIMIT 10)"
              className="font-mono bg-zinc-900 border-zinc-700 text-zinc-100 min-h-[150px] resize-y"
            />
            
            <Alert className="bg-zinc-700/20 border-zinc-600">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-xs">
                <ul className="list-disc pl-5 space-y-1 mt-1 text-zinc-300">
                  <li>Only SELECT queries are allowed for security reasons.</li>
                  <li>Use <code className="bg-zinc-800 px-1 rounded">students</code> as the table name.</li>
                  <li>Don&apos;t worry about quoting table or column names - the system handles that automatically.</li>
                  <li>Column names work in both <code className="bg-zinc-800 px-1 rounded">snake_case</code> and <code className="bg-zinc-800 px-1 rounded">camelCase</code> formats.</li>
                  <li>Example: <code className="bg-zinc-800 px-1 rounded">promising_student</code> and <code className="bg-zinc-800 px-1 rounded">promisingStudent</code> both work.</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-900/20 border-green-900 text-green-400">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {results && results.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-zinc-300">Query Results</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className={smallButtonClass}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadResults}
                    className={smallButtonClass}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="bg-zinc-900 rounded-md border border-zinc-700 overflow-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 text-zinc-400 text-left">
                    <tr>
                      {results.length > 0 && Object.keys(results[0]).map((key) => (
                        <th key={key} className="px-4 py-2 font-medium">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {results.map((row, rowIndex) => (
                      <tr key={rowIndex} className="text-zinc-300">
                        {Object.entries(row).map(([_key, value], colIndex) => (
                          <td key={colIndex} className="px-4 py-2 font-mono">
                            {typeof value === 'object' 
                              ? JSON.stringify(value) 
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results && results.length === 0 && (
            <div className="bg-zinc-900 p-4 rounded-md border border-zinc-700 text-zinc-400">
              Query executed successfully, but no results were returned.
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-zinc-700 pt-4">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          <Button 
            onClick={executeQuery}
            disabled={isLoading || !query.trim()}
            className="ml-auto flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Execute Query
          </Button>
        </CardFooter>
      </Card>

      {showSchemaInfo && (
        <div className="mt-4">
          <DatabaseTableInfo />
        </div>
      )}
    </>
  );
} 