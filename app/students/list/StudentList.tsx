// StudentList.tsx
"use client";

import React, { useState, FormEvent, useMemo, useCallback, memo } from "react";
import {
  Student,
  CreateStudentInput,
  UpdateStudentInput
} from "@/lib/students";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Import modular components
import { SearchBar } from "@/components/SearchBar";
import { ActionButtons } from "@/components/ActionButtons";
import { StudentForm } from "@/components/StudentForm";
import { PaginationControls } from "@/components/PaginationControls";
import QueryWizard from "@/components/queryWizard/QueryWizard";
import { NaturalLanguageSearch } from '@/components/NaturalLanguageSearch'
import { BulkEmailSender } from '@/components/BulkEmailSender'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStudents } from "@/hooks/useStudents";
import { Mail, List } from 'lucide-react'
import { StudentTableRow } from "@/components/StudentTableRow";

const STUDENTS_PER_PAGE = 5;

interface StudentListProps {
  initialStudents: Student[];
}

// Memoize the StudentTableRow component
const MemoizedStudentTableRow = memo(StudentTableRow)

export default function StudentList({ initialStudents }: StudentListProps) {
  const {
    filteredStudents,
    searchTerm,
    isLoading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    handleSearch,
    applyQuery,
  } = useStudents(initialStudents)

  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)

  // Memoize handlers
  const handleSelectAll = useCallback(() => {
    setIsSelectAll(!isSelectAll)
    setSelectedStudents(
      !isSelectAll ? filteredStudents.map((student) => student.id) : []
    )
  }, [isSelectAll, filteredStudents])

  const handleSelectStudent = useCallback((studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearch(e.target.value)
    },
    [handleSearch]
  )

  // Local UI state
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showQueryWizard, setShowQueryWizard] = useState(false);
  const [formData, setFormData] = useState<CreateStudentInput>({
    firstName: "",
    lastName: "",
    graduationYear: new Date().getFullYear(),
    email: "",
    phoneNumber: "",
    promisingStudent: false,
    schoolOrg: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Memoize expensive computations
  const totalPages = useMemo(() => 
    Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE),
    [filteredStudents.length]
  );

  const paginatedStudents = useMemo(() => 
    filteredStudents.slice(
      (currentPage - 1) * STUDENTS_PER_PAGE,
      currentPage * STUDENTS_PER_PAGE
    ),
    [filteredStudents, currentPage]
  );

  const selectedStudentObjects = useMemo(() => 
    filteredStudents.filter(student => 
      selectedStudents.includes(student.id)
    ),
    [filteredStudents, selectedStudents]
  );

  // Handle creating a new student
  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createStudent(formData);
      setIsCreating(false);
      setFormData({
        firstName: "",
        lastName: "",
        graduationYear: new Date().getFullYear(),
        email: "",
        phoneNumber: "",
        promisingStudent: false,
        schoolOrg: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      });
    } catch (error) {
      console.error("Error creating student:", error);
      alert("Failed to create student. Please try again.");
    }
  };

  // Handle updating a student
  const handleUpdate = async (id: number, data: UpdateStudentInput) => {
    try {
      // Validate required fields
      if (!data.firstName?.trim() || !data.lastName?.trim()) {
        alert("First name and last name are required");
        return;
      }
      if (!data.email?.includes("@")) {
        alert("Please enter a valid email address");
        return;
      }
      if (!data.graduationYear || data.graduationYear < new Date().getFullYear()) {
        alert("Please enter a valid graduation year");
        return;
      }
      if (!data.schoolOrg?.trim()) {
        alert("School/Organization is required");
        return;
      }

      // Format phone number if provided
      if (data.phoneNumber) {
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        if (!phoneRegex.test(data.phoneNumber)) {
          alert("Phone number should be in format: XXX-XXX-XXXX");
          return;
        }
      }

      // Format state if provided
      if (data.state) {
        data.state = data.state.toUpperCase();
        if (data.state.length !== 2) {
          alert("State should be a two-letter code (e.g., CA)");
          return;
        }
      }

      await updateStudent(id, data);
      setIsEditing(null);
      alert("Student updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student. Please check your input and try again.");
    }
  };

  // Handle deleting a student
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteStudent(id);
      setSelectedStudents((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
      alert("Student deleted successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
  };

  // Handle downloading selected students
  const handleDownloadSelected = async () => {
    try {
      const response = await fetch("/api/download-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate spreadsheet: ${errorText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "selected_students.xlsx";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error: unknown) {
      console.error("Error downloading students:", error);
      if (error instanceof Error) {
        alert(`Failed to download students: ${error.message}`);
      } else {
        alert("An unexpected error occurred while downloading students");
      }
    }
  };

  // Handle editing a student
  const handleEditStudent = (student: Student) => {
    setIsEditing(student.id);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      graduationYear: student.graduationYear,
      email: student.email,
      phoneNumber: student.phoneNumber ?? "",
      promisingStudent: student.promisingStudent,
      schoolOrg: student.schoolOrg,
      state: student.state,
      address: student.address ?? "",
      city: student.city ?? "",
      zipCode: student.zipCode ?? "",
    });
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="w-full mx-auto bg-zinc-800 border-zinc-700">
        <CardContent>
          <p className="text-zinc-400">Loading students...</p>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="w-full mx-auto bg-zinc-800 border-zinc-700">
        <CardContent>
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">Student List</CardTitle>
        <h1 className="text-zinc-400"> Total number of students: <strong className="text-zinc-100">{initialStudents.length}</strong></h1>
      </CardHeader>
      <CardContent className="flex-col flex gap-4">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-zinc-800 rounded-lg gap-1">
            <TabsTrigger 
              value="list" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
            >
              <List className="h-4 w-4" />
              <span>List View</span>
            </TabsTrigger>
            <TabsTrigger 
              value="email" 
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="list">
              {/* AI Components and Search */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NaturalLanguageSearch 
                  onSearchResults={(results) => {
                    handleSearch(""); // Clear the current search
                    applyQuery(results.filters.map(filter => ({
                      field: filter.field,
                      operator: filter.operation,
                      value: filter.value
                    })));
                    setCurrentPage(1); // Reset to first page
                  }} 
                />
                <Card className="w-full bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">Quick Search</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Search by name, email, or any other field
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SearchBar
                      searchTerm={searchTerm}
                      onSearchChange={handleSearchChange}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="mt-6">
                <ActionButtons
                  selectedStudentsCount={selectedStudents.length}
                  onAdd={() => setIsCreating(true)}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={() => setSelectedStudents([])}
                  onDownloadSelected={handleDownloadSelected}
                  showQueryWizard={showQueryWizard}
                  toggleQueryWizard={() => setShowQueryWizard(!showQueryWizard)}
                />
              </div>

              {/* Query Wizard */}
              {showQueryWizard && (
                <div className="mt-4">
                  <QueryWizard
                    onApplyQuery={applyQuery}
                    onClose={() => setShowQueryWizard(false)}
                  />
                </div>
              )}

              {/* Student Form for Creating */}
              {isCreating && (
                <div className="mt-4">
                  <StudentForm
                    formData={formData}
                    onChange={(e) => {
                      const { name, value, type, checked } = e.target;
                      setFormData((prev) => ({
                        ...prev,
                        [name]:
                          type === "checkbox"
                            ? checked
                            : name === "graduationYear"
                            ? parseInt(value, 10)
                            : value,
                      }));
                    }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreate(e);
                    }}
                    onCancel={() => setIsCreating(false)}
                    isEditing={false}
                  />
                </div>
              )}

              {/* Student Table */}
              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Select</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Graduation Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">State</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">School/Org</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Promising</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700">
                      {paginatedStudents.map((student) => (
                        <MemoizedStudentTableRow
                          key={student.id}
                          student={student}
                          isSelected={selectedStudents.includes(student.id)}
                          onSelect={() => handleSelectStudent(student.id)}
                          isEditing={isEditing === student.id}
                          onEdit={() => handleEditStudent(student)}
                          onDelete={() => handleDelete(student.id)}
                          formData={formData}
                          setFormData={setFormData}
                          handleUpdate={handleUpdate}
                          setIsEditing={setIsEditing}
                          handleInputChange={(e) => {
                            const { name, value, type, checked } = e.target;
                            setFormData((prev) => ({
                              ...prev,
                              [name]:
                                type === "checkbox"
                                  ? checked
                                  : name === "graduationYear"
                                  ? parseInt(value, 10)
                                  : value,
                            }));
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* No Students Found Message */}
              {filteredStudents.length === 0 && (
                <p className="text-center py-4 text-zinc-400">No students found.</p>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    onNext={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="email">
              {selectedStudents.length > 0 ? (
                <BulkEmailSender
                  selectedStudents={selectedStudentObjects}
                  onClose={() => setSelectedStudents([])}
                />
              ) : (
                <Card className="w-full bg-zinc-800 border-zinc-700">
                  <CardContent className="py-8">
                    <p className="text-center text-zinc-400">
                      Please select students from the list view to send emails.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}