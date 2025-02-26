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
  <form onSubmit={onSubmit} className="p-4 border-b border-zinc-700 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName" className="text-zinc-300">First Name</Label>
        <Input
          id="firstName"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={onChange}
          placeholder="First Name"
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName" className="text-zinc-300">Last Name</Label>
        <Input
          id="lastName"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={onChange}
          placeholder="Last Name"
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="graduationYear" className="text-zinc-300">Graduation Year</Label>
        <Input
          id="graduationYear"
          type="number"
          name="graduationYear"
          value={formData.graduationYear}
          onChange={onChange}
          placeholder="Graduation Year"
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-300">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          placeholder="Email"
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-zinc-300">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber ?? ''}
          onChange={onChange}
          placeholder="Phone Number"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolOrg" className="text-zinc-300">School/Organization</Label>
        <Input
          id="schoolOrg"
          type="text"
          name="schoolOrg"
          value={formData.schoolOrg ?? ''}
          onChange={onChange}
          placeholder="School/Organization"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="address" className="text-zinc-300">Address</Label>
        <Input
          id="address"
          type="text"
          name="address"
          value={formData.address ?? ''}
          onChange={onChange}
          placeholder="Address"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city" className="text-zinc-300">City</Label>
        <Input
          id="city"
          type="text"
          name="city"
          value={formData.city ?? ''}
          onChange={onChange}
          placeholder="City"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="state" className="text-zinc-300">State</Label>
        <Input
          id="state"
          type="text"
          name="state"
          value={formData.state ?? ''}
          onChange={onChange}
          placeholder="State"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="zipCode" className="text-zinc-300">Zip Code</Label>
        <Input
          id="zipCode"
          type="text"
          name="zipCode"
          value={formData.zipCode ?? ''}
          onChange={onChange}
          placeholder="Zip Code"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>
    </div>

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
        className="border-zinc-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
      />
      <Label htmlFor="promisingStudent" className="text-zinc-300">Promising Student</Label>
    </div>

    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="submit" 
        variant="default"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isEditing ? 'Save Changes' : 'Create Student'}
      </Button>
      <Button 
        type="button" 
        onClick={onCancel} 
        variant="default"
        className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
      >
        Cancel
      </Button>
    </div>
  </form>
)
