'use client'

import React, { useState } from 'react'
import { X, Plus, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { QueryCondition, Operator } from '@/types/interfaces'

interface QueryWizardProps {
  onApplyQuery: (conditions: QueryCondition[]) => void
  onClose: () => void
}

const fields = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'graduationYear', label: 'Graduation Year' },
  { value: 'phoneNumber', label: 'Phone Number' },
  { value: 'promisingStudent', label: 'Promising Student' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
]

const operators = {
  string: ['equals', 'contains'] as Operator[],
  number: ['equals', 'greaterThan', 'lessThan', 'between'] as Operator[],
  date: ['equals', 'before', 'after', 'between'] as Operator[],
  boolean: ['equals'] as Operator[],
}

export default function QueryWizard({ onApplyQuery, onClose }: QueryWizardProps) {
  const [conditions, setConditions] = useState<QueryCondition[]>([
    { field: '', operator: 'equals', value: '' },
  ])

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
    onClose() // Close the wizard after applying the query
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Advanced Query</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.map((condition, index) => (
          <div key={index} className="flex flex-wrap items-end gap-2 pb-4 border-b">
            {/* Field Selection */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor={`field-${index}`}>Field</Label>
              <Select
                value={condition.field}
                onValueChange={(value) => handleFieldChange(index, value)}
              >
                <SelectTrigger id={`field-${index}`}>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Operator Selection */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor={`operator-${index}`}>Operator</Label>
              <Select
                value={condition.operator}
                onValueChange={(value) => handleOperatorChange(index, value as Operator)}
                disabled={!condition.field}
              >
                <SelectTrigger id={`operator-${index}`}>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {condition.field &&
                    getOperatorOptions(condition.field).map((op) => (
                      <SelectItem key={op} value={op}>
                        {op.charAt(0).toUpperCase() + op.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {/* Value Input */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor={`value-${index}`}>Value</Label>
              {condition.field === 'promisingStudent' ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`value-${index}`}
                    checked={condition.value === true || condition.value === 'true'}
                    onCheckedChange={(checked) => handleValueChange(index, checked)}
                    disabled={!condition.operator}
                  />
                  <span>{condition.value === true || condition.value === 'true' ? 'Yes' : 'No'}</span>
                </div>
              ) : condition.field === 'createdAt' || condition.field === 'updatedAt' ? (
                <Input
                  id={`value-${index}`}
                  type="date"
                  value={condition.value as string}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  disabled={!condition.operator}
                />
              ) : (
                <Input
                  id={`value-${index}`}
                  type={condition.field === 'graduationYear' ? 'number' : 'text'}
                  value={condition.value as string}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  disabled={!condition.operator}
                />
              )}
            </div>
            {/* ValueTo Input for 'between' Operator */}
            {condition.operator === 'between' && (
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor={`valueTo-${index}`}>To</Label>
                {condition.field === 'createdAt' || condition.field === 'updatedAt' ? (
                  <Input
                    id={`valueTo-${index}`}
                    type="date"
                    value={condition.valueTo as string}
                    onChange={(e) => handleValueChange(index, e.target.value, true)}
                  />
                ) : (
                  <Input
                    id={`valueTo-${index}`}
                    type={condition.field === 'graduationYear' ? 'number' : 'text'}
                    value={condition.valueTo as string}
                    onChange={(e) => handleValueChange(index, e.target.value, true)}
                  />
                )}
              </div>
            )}
            {/* Remove Condition Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCondition(index)}
              className="mb-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove condition</span>
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={addCondition}>
          <Plus className="mr-2 h-4 w-4" /> Add Condition
        </Button>
        <Button onClick={handleApplyQuery}>
          <Search className="mr-2 h-4 w-4" /> Apply Query
        </Button>
      </CardFooter>
    </Card>
  )
}
