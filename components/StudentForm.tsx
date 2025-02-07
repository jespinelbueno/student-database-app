// components/StudentForm.tsx
import React, { ChangeEvent, FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CreateStudentInput } from '@/lib/students'

interface StudentFormProps {
  formData: CreateStudentInput
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isEditing: boolean
}

export const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
}) => (
  <form onSubmit={onSubmit} className="p-4 border-b space-y-2">
    <Input
      type="text"
      name="firstName"
      value={formData.firstName}
      onChange={onChange}
      placeholder="First Name"
      required
    />
    <Input
      type="text"
      name="lastName"
      value={formData.lastName}
      onChange={onChange}
      placeholder="Last Name"
      required
    />
    <Input
      type="number"
      name="graduationYear"
      value={formData.graduationYear}
      onChange={onChange}
      placeholder="Graduation Year"
      required
    />
    <Input
      type="email"
      name="email"
      value={formData.email}
      onChange={onChange}
      placeholder="Email"
      required
    />
    <Input
      type="tel"
      name="phoneNumber"
      value={formData.phoneNumber ?? ''}
      onChange={onChange}
      placeholder="Phone Number"
    />
    <Input
      type="text"
      name="schoolOrg"
      value={formData.schoolOrg ?? ''}
      onChange={onChange}
      placeholder="School/Organization"
    />
    <Input
      type="text"
      name="address"
      value={formData.address ?? ''}
      onChange={onChange}
      placeholder="Address"
    />
    <Input
      type="text"
      name="city"
      value={formData.city ?? ''}
      onChange={onChange}
      placeholder="City"
    />
    <Input
      type="text"
      name="state"
      value={formData.state ?? ''}
      onChange={onChange}
      placeholder="State"
    />
    <Input
      type="text"
      name="zipCode"
      value={formData.zipCode ?? ''}
      onChange={onChange}
      placeholder="Zip Code"
    />
    <div className="flex items-center space-x-2">
      <Checkbox
        id="promisingStudent"
        name="promisingStudent"
        checked={formData.promisingStudent}
        onCheckedChange={(checked) =>
          onChange({
            target: {
              name: 'promisingStudent',
              value: checked as boolean,
              type: 'checkbox',
            },
          } as unknown as ChangeEvent<HTMLInputElement>)
        }
      />
      <Label htmlFor="promisingStudent">Promising Student</Label>
    </div>

    <div className="flex justify-end space-x-2">
      <Button type="submit" className={isEditing ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700"}>
        {isEditing ? 'Save Changes' : 'Create Student'}
      </Button>
      <Button type="button" onClick={onCancel} variant="secondary" className="bg-zinc-500 hover:bg-zinc-700">
        Cancel
      </Button>
    </div>
  </form>
)
