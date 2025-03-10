// components/StudentTable.tsx
import React, { ChangeEvent } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Student } from '@/lib/students'
import { StudentTableRow } from '@/components/StudentTableRow'
import { CreateStudentInput } from '@/lib/students'
import { ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from '@/types/interfaces'

interface StudentTableProps {
  students: Student[]
  selectedStudents: number[]
  onSelectStudent: (id: number) => void
  isEditing: number | null
  onEdit: (student: Student) => void
  onDelete: (id: number) => void
  formData: CreateStudentInput
  setFormData: React.Dispatch<React.SetStateAction<CreateStudentInput>>
  handleUpdate: (id: number, data: CreateStudentInput) => void
  setIsEditing: React.Dispatch<React.SetStateAction<number | null>>
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  columnVisibility?: ColumnVisibility
  userRole?: string
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedStudents,
  onSelectStudent,
  isEditing,
  onEdit,
  onDelete,
  formData,
  setFormData,
  handleUpdate,
  setIsEditing,
  handleInputChange,
  columnVisibility = DEFAULT_COLUMN_VISIBILITY,
  userRole,
}) => (
  <div className="overflow-x-auto overflow-y-auto">
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
          <TableHead className="">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <StudentTableRow
            key={student.id}
            student={student}
            isSelected={selectedStudents.includes(student.id)}
            onSelect={() => onSelectStudent(student.id)}
            isEditing={isEditing === student.id}
            onEdit={() => onEdit(student)}
            onDelete={() => onDelete(student.id)}
            formData={formData}
            setFormData={setFormData}
            handleUpdate={handleUpdate}
            setIsEditing={setIsEditing}
            handleInputChange={handleInputChange}
            columnVisibility={columnVisibility}
            userRole={userRole}
          />
        ))}
      </TableBody>
    </Table>
  </div>
)
