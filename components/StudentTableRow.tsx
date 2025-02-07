// components/StudentTableRow.tsx
import React, { ChangeEvent } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Student } from '@/lib/students'
import { CreateStudentInput } from '@/lib/students'

interface StudentTableRowProps {
  student: Student
  isSelected: boolean
  onSelect: () => void
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  formData: CreateStudentInput
  setFormData: React.Dispatch<React.SetStateAction<CreateStudentInput>>
  handleUpdate: (id: number, data: CreateStudentInput) => void
  setIsEditing: React.Dispatch<React.SetStateAction<number | null>>
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const StudentTableRow: React.FC<StudentTableRowProps> = ({
  student,
  isSelected,
  onSelect,
  isEditing,
  onEdit,
  onDelete,
  formData,
  handleUpdate,
  setIsEditing,
  handleInputChange,
}) => (
  <TableRow className="text-zinc-100">
    <TableCell>
      <Checkbox 
        checked={isSelected} 
        onCheckedChange={onSelect}
        className="border-zinc-400 text-zinc-100 data-[state=checked]:text-zinc-100 data-[state=checked]:bg-zinc-700"
      />
    </TableCell>
    <TableCell>
      {isEditing ? (
        <Input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className="w-full text-zinc-100 bg-zinc-800"
        />
      ) : (
        <span className="text-zinc-100">{`${student.firstName} ${student.lastName}`}</span>
      )}
    </TableCell>
    <TableCell>
      {isEditing ? (
        <Input
          type="number"
          name="graduationYear"
          value={formData.graduationYear}
          onChange={handleInputChange}
          className="w-full text-zinc-100 bg-zinc-800"
        />
      ) : (
        <span className="text-zinc-100">{student.graduationYear}</span>
      )}
    </TableCell>
    <TableCell>
      {isEditing ? (
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full text-zinc-100 bg-zinc-800"
        />
      ) : (
        <span className="text-zinc-100">{student.email}</span>
      )}
    </TableCell>
    <TableCell>
      {isEditing ? (
        <Input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber ?? ''}
          onChange={handleInputChange}
          className="w-full text-zinc-100 bg-zinc-800"
        />
      ) : (
        <span className="text-zinc-100">{student.phoneNumber ?? ''}</span>
      )}
    </TableCell>
    <TableCell>
      {isEditing ? (
        <Input
          type="text"
          name="state"
          value={formData.state ?? ''}
          onChange={handleInputChange}
          className="w-full text-zinc-100 bg-zinc-800"
        />
      ) : (
        <span className="text-zinc-100">{student.state ?? ''}</span>
      )}
    </TableCell>
    <TableCell>
      {isEditing ? (
        <Input
          type="text"
          name="schoolOrg"
          value={formData.schoolOrg}
          onChange={handleInputChange}
          className="w-full text-zinc-100 bg-zinc-800"
        />
      ) : (
        <span className="text-zinc-100">{student.schoolOrg}</span>
      )}
    </TableCell>
    <TableCell>
      {isEditing ? (
        <Checkbox
          name="promisingStudent"
          checked={formData.promisingStudent}
          onCheckedChange={(checked) =>
            handleInputChange({
              target: {
                name: 'promisingStudent',
                value: checked as boolean,
                type: 'checkbox',
              },
            } as unknown as ChangeEvent<HTMLInputElement>)
          }
          className="border-zinc-400 text-zinc-100 data-[state=checked]:text-zinc-100 data-[state=checked]:bg-zinc-700"
        />
      ) : (
        <span className="text-zinc-100">{student.promisingStudent ? 'Yes' : 'No'}</span>
      )}
    </TableCell>
    <TableCell className="text-right">
      {isEditing ? (
        <>
          <Button onClick={() => handleUpdate(student.id, formData)} className="mr-2">
            Save
          </Button>
          <Button onClick={() => setIsEditing(null)} variant="secondary">
            Cancel
          </Button>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <Button onClick={onEdit} className="w-20" size="sm">
            Edit
          </Button>
          <Button onClick={onDelete} className='w-20 text-black'
          variant="outline" size="sm">
            Delete
          </Button>
        </div>
      )}
    </TableCell>
  </TableRow>
)
