'use client'

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Student, CreateStudentInput, UpdateStudentInput } from '@/lib/students'
import QueryWizard from '../queryWizard/QueryWizard'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const STUDENTS_PER_PAGE = 5

interface QueryCondition {
  field: string
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in'
  value: string | number | boolean
  valueTo?: string | number
}

interface StudentListProps {
  initialStudents: Student[]
}

export default function StudentList({ initialStudents }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(initialStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [showQueryWizard, setShowQueryWizard] = useState(false)
  const [formData, setFormData] = useState<CreateStudentInput>({
    firstName: '',
    lastName: '',
    graduationYear: new Date().getFullYear(),
    email: '',
    phoneNumber: '',
    promisingStudent: false,
    schoolOrg:''
  })

  useEffect(() => {
    if (initialStudents.length === 0) {
      fetchStudents()
    }
  }, [initialStudents])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setStudents(data)
      setFilteredStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      alert('Failed to fetch students. Please try again.')
    }
  }

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  )

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               name === 'graduationYear' ? parseInt(value, 10) : value
    }))
  }

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to create student')
      const newStudent = await response.json()
      setStudents([...students, newStudent])
      setFilteredStudents([...filteredStudents, newStudent])
      setIsCreating(false)
      setFormData({
        firstName: '',
        lastName: '',
        graduationYear: new Date().getFullYear(),
        email: '',
        phoneNumber: '',
        promisingStudent: false,
        schoolOrg:'',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      })
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Failed to create student. Please try again.')
    }
  }

  const handleUpdate = async (id: number, data: UpdateStudentInput) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update student')
      }
      const updatedStudent = await response.json()
      const updatedStudents = students.map(s => s.id === id ? updatedStudent : s)
      setStudents(updatedStudents)
      setFilteredStudents(updatedStudents)
      setIsEditing(null)
      alert('Student updated successfully')
    } catch (error) {
      console.error('Error updating student:', error)
      alert(error instanceof Error ? error.message : "Failed to update student. Please try again.")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete student')
      const updatedStudents = students.filter(s => s.id !== id)
      setStudents(updatedStudents)
      setFilteredStudents(updatedStudents)
      setSelectedStudents(selectedStudents.filter(selectedId => selectedId !== id))
      alert('Student deleted successfully')
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student. Please try again.')
    }
  }

  const handleSelectStudent = (id: number) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(studentId => studentId !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const currentPageIds = paginatedStudents.map(student => student.id)
    setSelectedStudents(prev => {
      const newSelection = [...prev]
      currentPageIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id)
        }
      })
      return newSelection
    })
  }

  const handleDeselectAll = () => {
    const currentPageIds = paginatedStudents.map(student => student.id)
    setSelectedStudents(prev => prev.filter(id => !currentPageIds.includes(id)))
  }

  const handleDownloadSelected = async () => {
    try {
      const response = await fetch('/api/download-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate spreadsheet: ${errorText}`)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'selected_students.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error: unknown) {
      console.error('Error downloading students:', error)
      if (error instanceof Error) {
        alert(`Failed to download students: ${error.message}`)
      } else {
        alert('An unexpected error occurred while downloading students')
      }
    }
  }

  const applyQuery = (conditions: QueryCondition[]) => {
    const filtered = students.filter(student => {
      return conditions.every(condition => {
        const { field, operator, value, valueTo } = condition
        const studentValue = student[field as keyof Student]
        
        switch (operator) {
          case 'equals':
            return studentValue === value
          case 'contains':
            return String(studentValue).toLowerCase().includes(String(value).toLowerCase())
          case 'greaterThan':
            return Number(studentValue) > Number(value)
          case 'lessThan':
            return Number(studentValue) < Number(value)
          case 'between':
            return Number(studentValue) >= Number(value) && Number(studentValue) <= Number(valueTo)
          case 'in':
            return String(value).split(',').map(v => v.trim()).includes(String(studentValue))
          default:
            return true
        }
      })
    })
    setFilteredStudents(filtered)
    setCurrentPage(1)
  }

  return (
    
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Student List</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="pl-0 pr-0 mb-8">
            <Input
              type="text"
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value)
                setFilteredStudents(
                  students.filter(student => 
                    student.firstName.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    student.lastName.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    student.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    student.graduationYear.toString().includes(e.target.value) ||
                    (student.phoneNumber ?? '').includes(e.target.value) ||
                    (student.promisingStudent ? 'yes' : 'no').includes(e.target.value.toLowerCase())
                  )
                )
                setCurrentPage(1)
              }}
            />
          </div>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <Button onClick={() => setShowQueryWizard(!showQueryWizard)}>
              {showQueryWizard ? 'Hide Query Wizard' : 'Show Query Wizard'}
            </Button>
            <div className="flex space-x-2">
              <Button onClick={() => setIsCreating(true)}>
                Add New Student
              </Button>
              <Button onClick={handleSelectAll} variant="secondary">
                Select All
              </Button>
              <Button onClick={handleDeselectAll} variant="secondary">
                Deselect All
              </Button>
              <Button
                onClick={handleDownloadSelected}
                disabled={selectedStudents.length === 0}
              >
                Download Selected ({selectedStudents.length})
              </Button>
            </div>
          </div>

          {showQueryWizard && (
            <QueryWizard 
              onApplyQuery={applyQuery} 
              onClose={() => setShowQueryWizard(false)}
            />
          )}
          

          {isCreating && (
            <form onSubmit={handleCreate} className="p-4 border-b space-y-2">
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                required
              />
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
              />
              <Input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleInputChange}
                placeholder="Graduation Year"
                required
              />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
              />
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber ?? ''}
                onChange={handleInputChange}
                placeholder="Phone Number"
              />
                            <Input
                type="text"
                name="schoolOrg"
                value={formData.schoolOrg ?? ''}
                onChange={handleInputChange}
                placeholder="School/Organization"
              />
<Input
                type="text"
                name="address"
                value={formData.address ?? ''}
                onChange={handleInputChange}
                placeholder="Address"
              />
              <Input
                type="text"
                name="city"
                value={formData.city ?? ''}
                onChange={handleInputChange}
                placeholder="City"
              />
              <Input
                type="text"
                name="state"
                value={formData.state ?? ''}
                onChange={handleInputChange}
                placeholder="State"
              />
              <Input
                type="text"
                name="zipCode"
                value={formData.zipCode ?? ''}
                onChange={handleInputChange}
                placeholder="Zip Code"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="promisingStudent"
                  name="promisingStudent"
                  checked={formData.promisingStudent}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, promisingStudent: checked as boolean }))
                  }
                />
                <Label htmlFor="promisingStudent">Promising Student</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="submit">
                  Create Student
                </Button>
                <Button type="button" onClick={() => setIsCreating(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Graduation Year</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>School/Organization</TableHead>
                  <TableHead>Promising Student</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => handleSelectStudent(student.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {isEditing === student.id ? (
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        `${student.firstName} ${student.lastName}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing === student.id ? (
                        <Input
                          type="number"
                          value={formData.graduationYear}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) })}
                          className="w-full"
                        />
                      ) : (
                        student.graduationYear
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing === student.id ? (
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full"
                        
                        />
                      ) : (
                        student.email
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing === student.id ? (
                        <Input
                          type="tel"
                          value={formData.phoneNumber ?? ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        student.phoneNumber ?? ''
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing === student.id ? (
                        <Input
                          type="text"
                          value={formData.state ?? ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        student.state ?? ''
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing === student.id ? (
                        <Input
                          type="text"
                          value={formData.schoolOrg}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, schoolOrg: e.target.value })}
                          className="w-full"
                        
                        />
                      ) : (
                        student.schoolOrg
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing === student.id ? (
                        <Checkbox
                          checked={formData.promisingStudent}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, promisingStudent: checked as boolean }))
                          }
                        />
                      ) : (
                        student.promisingStudent ? 'Yes' : 'No'
                      )}
                    </TableCell>
                    

                    <TableCell className="text-right">
                      {isEditing === student.id ? (
                        <>
                          <Button
                            onClick={() => handleUpdate(student.id, formData)}
                            className="mr-2"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setIsEditing(null)}
                            variant="secondary"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                        <div className='flex flex-col gap-3'>
                        <Button
                            onClick={() => {
                              setIsEditing(student.id)
                              setFormData({
                                firstName: student.firstName,
                                lastName: student.lastName,
                                graduationYear: student.graduationYear,
                                email: student.email,
                                phoneNumber: student.phoneNumber ?? '',
                                promisingStudent: student.promisingStudent,
                                schoolOrg: student.schoolOrg,
                                state: student.state
                              })
                            }}
                            className="mr-2"
                            size='sm'
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(student.id)}
                            variant="destructive"
                            size='sm'
                          >
                            Delete
                          </Button>
                        </div>

                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <p className="text-center py-4 text-gray-500">No students found.</p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center p-4 border-t">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="mr-2"
              >
                Previous
              </Button>
              <span className="px-4 py-2 bg-gray-100 rounded">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="ml-2"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}