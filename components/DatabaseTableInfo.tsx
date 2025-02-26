'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function DatabaseTableInfo() {
  const columns = [
    { name: 'id', type: 'number', description: 'Student ID (primary key)' },
    { nameOptions: ['firstName', 'first_name'], type: 'string', description: 'Student first name' },
    { nameOptions: ['lastName', 'last_name'], type: 'string', description: 'Student last name' },
    { name: 'email', type: 'string', description: 'Email address' },
    { nameOptions: ['graduationYear', 'graduation_year'], type: 'number', description: 'Expected graduation year' },
    { nameOptions: ['phoneNumber', 'phone_number'], type: 'string', description: 'Contact phone number (optional)' },
    { nameOptions: ['promisingStudent', 'promising_student'], type: 'boolean', description: 'Whether student is flagged as promising' },
    { nameOptions: ['schoolOrg', 'school_org'], type: 'string', description: 'School or organization name' },
    { name: 'address', type: 'string', description: 'Street address (optional)' },
    { name: 'city', type: 'string', description: 'City (optional)' },
    { name: 'state', type: 'string', description: 'State (optional)' },
    { nameOptions: ['zipCode', 'zip_code'], type: 'string', description: 'ZIP/Postal code (optional)' },
    { nameOptions: ['createdAt', 'created_at'], type: 'date', description: 'Record creation timestamp' },
    { nameOptions: ['updatedAt', 'updated_at'], type: 'date', description: 'Record last update timestamp' }
  ]

  const sampleQueriesSnakeCase = [
    { description: 'Get all students', query: 'SELECT * FROM students' },
    { description: 'Filter by promising flag', query: 'SELECT first_name, last_name, email FROM students WHERE promising_student = true' },
    { description: 'Filter by graduation year', query: 'SELECT * FROM students WHERE graduation_year > 2023' },
    { description: 'Filter by state', query: 'SELECT * FROM students WHERE state = \'CA\'' },
    { description: 'Order and limit results', query: 'SELECT * FROM students ORDER BY last_name ASC LIMIT 10' },
    { description: 'Count students', query: 'SELECT COUNT(*) FROM students' },
    { description: 'Count by state', query: 'SELECT state, COUNT(*) FROM students GROUP BY state ORDER BY COUNT(*) DESC' }
  ]

  const sampleQueriesCamelCase = [
    { description: 'Get all students', query: 'SELECT * FROM students' },
    { description: 'Filter by promising flag', query: 'SELECT firstName, lastName, email FROM students WHERE promisingStudent = true' },
    { description: 'Filter by graduation year', query: 'SELECT * FROM students WHERE graduationYear > 2023' },
    { description: 'Filter by state', query: 'SELECT * FROM students WHERE state = \'CA\'' },
    { description: 'Order and limit results', query: 'SELECT * FROM students ORDER BY lastName ASC LIMIT 10' },
    { description: 'Count students', query: 'SELECT COUNT(*) FROM students' },
    { description: 'Count by state', query: 'SELECT state, COUNT(*) FROM students GROUP BY state ORDER BY COUNT(*) DESC' }
  ]

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Database Schema Reference
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Use this reference when writing SQL queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Student Table Columns</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700">
                <TableHead className="text-zinc-400">Column Name</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column, index) => (
                <TableRow key={index} className="border-zinc-700">
                  <TableCell className="font-mono text-zinc-300">
                    {column.nameOptions ? (
                      <>
                        <span className="text-emerald-400">{column.nameOptions[0]}</span>{' '}
                        or{' '}
                        <span className="text-emerald-400">{column.nameOptions[1]}</span>
                      </>
                    ) : (
                      <span className="text-emerald-400">{column.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-300">{column.type}</TableCell>
                  <TableCell className="text-zinc-300">{column.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Example Queries</h3>
          
          <Tabs defaultValue="snake_case" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-zinc-900 rounded-lg gap-1">
              <TabsTrigger 
                value="snake_case" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-2"
              >
                snake_case Style
              </TabsTrigger>
              <TabsTrigger 
                value="camelCase" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-2"
              >
                camelCase Style
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="snake_case" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700">
                    <TableHead className="text-zinc-400">Description</TableHead>
                    <TableHead className="text-zinc-400">SQL Query</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleQueriesSnakeCase.map((example, index) => (
                    <TableRow key={index} className="border-zinc-700">
                      <TableCell className="text-zinc-300">{example.description}</TableCell>
                      <TableCell className="font-mono text-zinc-300">{example.query}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="camelCase" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700">
                    <TableHead className="text-zinc-400">Description</TableHead>
                    <TableHead className="text-zinc-400">SQL Query</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleQueriesCamelCase.map((example, index) => (
                    <TableRow key={index} className="border-zinc-700">
                      <TableCell className="text-zinc-300">{example.description}</TableCell>
                      <TableCell className="font-mono text-zinc-300">{example.query}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-sm text-zinc-400 space-y-2">
          <p><strong>Note:</strong> Table name is &quot;students&quot; in SQL queries (will be mapped to the actual database table).</p>
          <p>Column names can be used in either <code className="bg-zinc-900 px-1 rounded">snake_case</code> (e.g., <code className="bg-zinc-900 px-1 rounded">first_name</code>) or <code className="bg-zinc-900 px-1 rounded">camelCase</code> (e.g., <code className="bg-zinc-900 px-1 rounded">firstName</code>).</p>
          <p>Only SELECT queries are allowed for security reasons.</p>
          <p>Results will include both naming styles for maximum compatibility with your code.</p>
        </div>
      </CardContent>
    </Card>
  )
} 