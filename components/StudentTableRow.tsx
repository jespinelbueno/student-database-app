// components/StudentTableRow.tsx
import React, { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Student } from '@/lib/students'
import { CreateStudentInput } from '@/lib/students'
import { ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from '@/types/interfaces'

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
  columnVisibility: ColumnVisibility
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
  columnVisibility = DEFAULT_COLUMN_VISIBILITY,
}) => {
  return (
  <tr className="text-zinc-100 border-b border-zinc-700">
    {columnVisibility.select && (
      <td className="px-2 py-3 whitespace-nowrap align-middle">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onSelect}
          className="border-zinc-400 text-zinc-100 data-[state=checked]:text-zinc-100 data-[state=checked]:bg-zinc-700"
        />
      </td>
    )}
    
    {(columnVisibility.firstName || columnVisibility.lastName) && (
      <td className="px-2 py-3 align-middle">
        {isEditing ? (
          <div className="flex gap-1">
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First"
              className="w-1/2 text-zinc-100 bg-zinc-800 text-sm"
            />
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last"
              className="w-1/2 text-zinc-100 bg-zinc-800 text-sm"
            />
          </div>
        ) : (
          <div className="truncate text-zinc-100" title={`${student.firstName} ${student.lastName}`}>
            {`${student.firstName} ${student.lastName}`}
          </div>
        )}
      </td>
    )}
    
    {columnVisibility.graduationYear && (
      <td className="px-2 py-3 whitespace-nowrap align-middle">
        {isEditing ? (
          <Input
            type="number"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleInputChange}
            min={new Date().getFullYear()}
            className="w-full text-zinc-100 bg-zinc-800 text-sm"
          />
        ) : (
          <span className="text-zinc-100">{student.graduationYear}</span>
        )}
      </td>
    )}
    
    {columnVisibility.email && (
      <td className="px-2 py-3 align-middle">
        {isEditing ? (
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
            className="w-full text-zinc-100 bg-zinc-800 text-sm"
          />
        ) : (
          <div className="truncate text-zinc-100" title={student.email}>
            {student.email}
          </div>
        )}
      </td>
    )}
    
    {columnVisibility.phoneNumber && (
      <td className="px-2 py-3 whitespace-nowrap align-middle">
        {isEditing ? (
          <Input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber ?? ''}
            onChange={handleInputChange}
            placeholder="XXX-XXX-XXXX"
            pattern="\d{3}-\d{3}-\d{4}"
            className="w-full text-zinc-100 bg-zinc-800 text-sm"
          />
        ) : (
          <span className="text-zinc-100">{student.phoneNumber ?? ''}</span>
        )}
      </td>
    )}
    
    {columnVisibility.state && (
      <td className="px-2 py-3 whitespace-nowrap align-middle">
        {isEditing ? (
          <Input
            type="text"
            name="state"
            value={formData.state ?? ''}
            onChange={handleInputChange}
            placeholder="CA"
            maxLength={2}
            className="w-full text-zinc-100 bg-zinc-800 uppercase text-sm"
          />
        ) : (
          <span className="text-zinc-100">{student.state ?? ''}</span>
        )}
      </td>
    )}
    
    {columnVisibility.schoolOrg && (
      <td className="px-2 py-3 align-middle">
        {isEditing ? (
          <Input
            type="text"
            name="schoolOrg"
            value={formData.schoolOrg}
            onChange={handleInputChange}
            className="w-full text-zinc-100 bg-zinc-800 text-sm"
          />
        ) : (
          <div className="truncate text-zinc-100" title={student.schoolOrg}>
            {student.schoolOrg}
          </div>
        )}
      </td>
    )}
    
    {columnVisibility.promisingStudent && (
      <td className="px-2 py-3 whitespace-nowrap text-center align-middle">
        {isEditing ? (
          <Checkbox
            name="promisingStudent"
            checked={formData.promisingStudent}
            onCheckedChange={(checked) => {
              console.log('Checkbox changed:', checked);
              const booleanValue = checked === true;
              handleInputChange({
                target: {
                  name: 'promisingStudent',
                  value: booleanValue,
                  type: 'checkbox',
                  checked: booleanValue,
                },
              } as unknown as ChangeEvent<HTMLInputElement>)
            }}
            className="border-zinc-400 text-zinc-100 data-[state=checked]:text-zinc-100 data-[state=checked]:bg-zinc-700"
          />
        ) : (
          <span className="text-zinc-100">{student.promisingStudent ? 'Yes' : 'No'}</span>
        )}
      </td>
    )}
    
    {columnVisibility.actions && (
      <td className="px-2 py-3 whitespace-nowrap text-right align-middle">
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <Button 
              onClick={() => handleUpdate(student.id, formData)} 
              variant="default"
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save
            </Button>
            <Button 
              onClick={() => setIsEditing(null)} 
              variant="secondary" 
              size="sm"
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <Button 
              onClick={onEdit} 
              variant="default"
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Edit
            </Button>
            <Button 
              onClick={onDelete} 
              variant="destructive"
              size="sm"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        )}
      </td>
    )}
  </tr>
  );
}
