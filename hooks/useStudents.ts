// src/hooks/useStudents.ts
import { useState, useEffect, useMemo } from 'react'
import { Student, CreateStudentInput, UpdateStudentInput } from '@/lib/students'
import { QueryCondition } from '@/types/interfaces'
import {
  fetchStudents as fetchStudentsService,
  createStudent as createStudentService,
  updateStudent as updateStudentService,
  deleteStudent as deleteStudentService,
} from '@/services/studentService'

export const useStudents = (initialStudents: Student[]) => {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<QueryCondition[]>([])

  // Memoize filtered students
  const filteredStudents = useMemo(() => {
    let result = students;

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((student) =>
        ['firstName', 'lastName', 'email', 'phoneNumber', 'graduationYear']
          .some((key) => 
            String(student[key as keyof Student])
              .toLowerCase()
              .includes(searchLower)
          )
      );
    }

    // Apply query conditions
    if (activeFilters.length > 0) {
      result = result.filter((student) => {
        return activeFilters.every((condition) => {
          const { field, operator, value, valueTo } = condition
          const studentValue = student[field as keyof Student]

          switch (operator) {
            case 'equals':
              return studentValue == value
            case 'contains':
              return String(studentValue).toLowerCase().includes(String(value).toLowerCase())
            case 'greaterThan':
              return Number(studentValue) > Number(value)
            case 'lessThan':
              return Number(studentValue) < Number(value)
            case 'between':
              return (
                Number(studentValue) >= Number(value) &&
                Number(studentValue) <= Number(valueTo)
              )
            case 'in':
              return String(value)
                .split(',')
                .map((v) => v.trim())
                .includes(String(studentValue))
            default:
              return true
          }
        })
      })
    }

    return result;
  }, [students, searchTerm, activeFilters]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const applyQuery = (conditions: QueryCondition[]) => {
    setActiveFilters(conditions);
  };

  // Fetch students if initialStudents is empty
  useEffect(() => {
    if (initialStudents.length === 0) {
      fetchStudents()
    }
  }, [initialStudents])

  const fetchStudents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchStudentsService()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to fetch students. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const createStudent = async (data: CreateStudentInput) => {
    try {
      const newStudent = await createStudentService(data)
      setStudents((prev) => [...prev, newStudent])
      return newStudent
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  }

  const updateStudent = async (id: number, data: UpdateStudentInput) => {
    try {
      const updatedStudent = await updateStudentService(id, data)
      setStudents((prev) =>
        prev.map((student) => (student.id === id ? updatedStudent : student))
      )
      return updatedStudent
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  const deleteStudent = async (id: number) => {
    try {
      await deleteStudentService(id)
      setStudents((prev) => prev.filter((student) => student.id !== id))
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  }

  return {
    students,
    filteredStudents,
    searchTerm,
    isLoading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    applyQuery,
    handleSearch,
  }
}
