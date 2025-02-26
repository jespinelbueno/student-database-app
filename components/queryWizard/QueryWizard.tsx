'use client'

import React, { useState } from 'react'
import { X, Plus, Search, Columns } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QueryCondition, Operator, ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from '@/types/interfaces'

interface QueryWizardProps {
  onApplyQuery: (conditions: QueryCondition[]) => void
  onUpdateColumnVisibility?: (visibility: ColumnVisibility) => void
  onClose: () => void
  initialColumnVisibility?: ColumnVisibility
}

const fields = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'graduationYear', label: 'Graduation Year' },
  { value: 'phoneNumber', label: 'Phone Number' },
  { value: 'promisingStudent', label: 'Promising Student' },
  { value: 'schoolOrg', label: 'School/Organization' },
  { value: 'state', label: 'State' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
]

const operators = {
  string: ['equals', 'contains'] as Operator[],
  number: ['equals', 'greaterThan', 'lessThan', 'between'] as Operator[],
  date: ['equals', 'before', 'after', 'between'] as Operator[],
  boolean: ['equals'] as Operator[],
}

export default function QueryWizard({ 
  onApplyQuery, 
  onUpdateColumnVisibility, 
  onClose,
  initialColumnVisibility = DEFAULT_COLUMN_VISIBILITY
}: QueryWizardProps) {
  const [conditions, setConditions] = useState<QueryCondition[]>([
    { field: '', operator: 'equals', value: '' },
  ])
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(initialColumnVisibility)

  const handleFieldChange = (index: number, value: string) => {
    const newConditions = [...conditions]
    newConditions[index].field = value
    newConditions[index].operator = getOperatorOptions(value)[0] // Assign first valid operator
    newConditions[index].value = ''
    newConditions[index].valueTo = undefined
    setConditions(newConditions)
  }

  const handleOperatorChange = (index: number, value: Operator) => {
    const newConditions = [...conditions]
    newConditions[index].operator = value
    newConditions[index].value = ''
    newConditions[index].valueTo = undefined
    setConditions(newConditions)
  }

  const handleValueChange = (
    index: number,
    value: string | number | boolean,
    isSecondValue: boolean = false
  ) => {
    const newConditions = [...conditions]
    if (isSecondValue) {
      newConditions[index].valueTo = value
    } else {
      newConditions[index].value = value
    }
    setConditions(newConditions)
  }

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }])
  }

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index)
    setConditions(newConditions)
  }

  const getOperatorOptions = (fieldName: string): Operator[] => {
    const fieldType =
      fieldName === 'graduationYear'
        ? 'number'
        : fieldName === 'promisingStudent'
        ? 'boolean'
        : fieldName === 'createdAt' || fieldName === 'updatedAt'
        ? 'date'
        : 'string'
    return operators[fieldType as keyof typeof operators]
  }

  const isValidCondition = (condition: QueryCondition) => {
    return (
      condition.field &&
      condition.operator &&
      condition.value !== '' &&
      (condition.operator !== 'between' ||
        (condition.valueTo !== undefined && condition.valueTo.toString().trim() !== ''))
    )
  }

  const handleApplyQuery = () => {
    const validConditions = conditions.filter(isValidCondition)
    onApplyQuery(validConditions)
    
    // Apply column visibility if the handler is provided
    if (onUpdateColumnVisibility) {
      onUpdateColumnVisibility(columnVisibility)
    }
    
    onClose() // Close the wizard after applying the query
  }

  const handleColumnVisibilityChange = (column: keyof ColumnVisibility, checked: boolean) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: checked
    }))
  }

  const handleSelectAllColumns = (checked: boolean) => {
    const newVisibility = { ...columnVisibility }
    Object.keys(newVisibility).forEach(key => {
      newVisibility[key as keyof ColumnVisibility] = checked
    })
    // Always keep select and actions visible
    newVisibility.select = true
    newVisibility.actions = true
    setColumnVisibility(newVisibility)
  }

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-zinc-100">Advanced Query</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="filters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-zinc-700 rounded-lg gap-1 mb-4">
            <TabsTrigger 
              value="filters" 
              className="data-[state=active]:bg-zinc-600 data-[state=active]:text-zinc-100 py-2"
            >
              <Search className="h-4 w-4 mr-2" />
              Filters
            </TabsTrigger>
            <TabsTrigger 
              value="columns" 
              className="data-[state=active]:bg-zinc-600 data-[state=active]:text-zinc-100 py-2"
            >
              <Columns className="h-4 w-4 mr-2" />
              Columns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={index} className="flex flex-wrap items-end gap-2 pb-4 border-b border-zinc-700">
                {/* Field Selection */}
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor={`field-${index}`} className="text-zinc-300">Field</Label>
                  <Select
                    value={condition.field}
                    onValueChange={(value) => handleFieldChange(index, value)}
                  >
                    <SelectTrigger id={`field-${index}`} className="bg-zinc-900 border-zinc-700 text-zinc-100">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {fields.map((field) => (
                        <SelectItem key={field.value} value={field.value} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Operator Selection */}
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor={`operator-${index}`} className="text-zinc-300">Operator</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => handleOperatorChange(index, value as Operator)}
                    disabled={!condition.field}
                  >
                    <SelectTrigger id={`operator-${index}`} className="bg-zinc-900 border-zinc-700 text-zinc-100">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {condition.field &&
                        getOperatorOptions(condition.field).map((op) => (
                          <SelectItem key={op} value={op} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                            {op.charAt(0).toUpperCase() + op.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Value Input */}
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor={`value-${index}`} className="text-zinc-300">Value</Label>
                  {condition.field === 'promisingStudent' ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`value-${index}`}
                        checked={condition.value === true || condition.value === 'true'}
                        onCheckedChange={(checked) => handleValueChange(index, checked)}
                        disabled={!condition.operator}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                      <span className="text-zinc-300">{condition.value === true || condition.value === 'true' ? 'Yes' : 'No'}</span>
                    </div>
                  ) : condition.field === 'createdAt' || condition.field === 'updatedAt' ? (
                    <Input
                      id={`value-${index}`}
                      type="date"
                      value={condition.value as string}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      disabled={!condition.operator}
                      className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-zinc-700"
                    />
                  ) : (
                    <Input
                      id={`value-${index}`}
                      type={condition.field === 'graduationYear' ? 'number' : 'text'}
                      value={condition.value as string}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      disabled={!condition.operator}
                      className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-zinc-700"
                    />
                  )}
                </div>
                {/* ValueTo Input for 'between' Operator */}
                {condition.operator === 'between' && (
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor={`valueTo-${index}`} className="text-zinc-300">To</Label>
                    {condition.field === 'createdAt' || condition.field === 'updatedAt' ? (
                      <Input
                        id={`valueTo-${index}`}
                        type="date"
                        value={condition.valueTo as string}
                        onChange={(e) => handleValueChange(index, e.target.value, true)}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-zinc-700"
                      />
                    ) : (
                      <Input
                        id={`valueTo-${index}`}
                        type={condition.field === 'graduationYear' ? 'number' : 'text'}
                        value={condition.valueTo as string}
                        onChange={(e) => handleValueChange(index, e.target.value, true)}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-zinc-700"
                      />
                    )}
                  </div>
                )}
                {/* Remove Condition Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => removeCondition(index)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove condition</span>
                </Button>
              </div>
            ))}
            <Button 
              variant="secondary" 
              onClick={addCondition}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Condition
            </Button>
          </TabsContent>

          <TabsContent value="columns" className="space-y-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-700">
              <h3 className="text-zinc-100 font-medium">Visible Columns</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleSelectAllColumns(true)}
                >
                  Select All
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleSelectAllColumns(false)}
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(columnVisibility)
                .filter(([key]) => key !== 'select' && key !== 'actions') // Always keep select and actions
                .map(([key, value]) => {
                  const field = fields.find(f => f.value === key) || { value: key, label: key.charAt(0).toUpperCase() + key.slice(1) }
                  return (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={`column-${key}`}
                        checked={value}
                        onCheckedChange={(checked) => handleColumnVisibilityChange(key as keyof ColumnVisibility, checked)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                      <Label htmlFor={`column-${key}`} className="text-zinc-300">
                        {field.label}
                      </Label>
                    </div>
                  )
                })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleApplyQuery} 
          variant="success"
        >
          <Search className="mr-2 h-4 w-4" /> Apply Changes
        </Button>
      </CardFooter>
    </Card>
  )
}
