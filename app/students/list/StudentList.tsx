// StudentList.tsx
"use client";

import React, { useState, FormEvent, useMemo, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import {
  Student,
  CreateStudentInput,
  UpdateStudentInput
} from "@/lib/students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import modular components
import { ActionButtons } from "@/components/ActionButtons";
import { StudentForm } from "@/components/StudentForm";
import { PaginationControls } from "@/components/PaginationControls";
import { BulkEmailSender } from '@/components/BulkEmailSender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudents } from "@/hooks/useStudents";
import { Mail, List } from 'lucide-react';
import { StudentTableRow } from "@/components/StudentTableRow";
import { ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from "@/types/interfaces";
import { Checkbox } from "@/components/ui/checkbox";
import { UnifiedSearch } from "@/components/UnifiedSearch";
import { NLQueryResult, QueryFilter } from "@/lib/students";

const STUDENTS_PER_PAGE = 5;

interface StudentListProps {
  initialStudents: Student[];
}

// Memoize the StudentTableRow component
const MemoizedStudentTableRow = memo(StudentTableRow)

export default function StudentList({ initialStudents }: StudentListProps) {
  const { data: session } = useSession();
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
    setFilteredStudents,
  } = useStudents(initialStudents)

  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(DEFAULT_COLUMN_VISIBILITY)

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

  const handleColumnVisibilityChange = useCallback((newVisibility: ColumnVisibility) => {
    setColumnVisibility(newVisibility)
  }, [])

  // Local UI state
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Handler for AI search results
  const handleAISearchResults = (results: NLQueryResult) => {
    handleSearch(""); // Clear the current search
    applyQuery(results.filters.map((filter: QueryFilter) => ({
      field: filter.field,
      operator: filter.operation,
      value: filter.value
    })));
    setCurrentPage(1); // Reset to first page
  }

  // Handle SQL query results
  const handleSQLQueryResults = (results: Student[]) => {
    if (!Array.isArray(results)) {
      console.error('Invalid results format:', results);
      return;
    }
    
    // Clear any existing search or filters
    handleSearch("");
    
    // Update the filtered students list
    setFilteredStudents(results);
    
    // Reset pagination
    setCurrentPage(1);
    
    // Clear any selected students
    setSelectedStudents([]);
    setIsSelectAll(false);
  };

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

      // Ensure promisingStudent is a boolean
      data.promisingStudent = Boolean(data.promisingStudent);
      
      // Log data before sending to API
      console.log('Updating student with data:', JSON.stringify(data));

      const updatedStudent = await updateStudent(id, data);
      
      // Update the student in the filtered students list to reflect changes immediately
      if (updatedStudent) {
        setFilteredStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === id ? {...student, ...data} : student
          )
        );
      }
      
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
      // If no students are selected, use all filtered students
      const studentsToDownload = selectedStudents.length > 0 
        ? selectedStudents 
        : filteredStudents.map(student => student.id);
      
      // Confirm download if downloading all filtered students
      if (selectedStudents.length === 0 && filteredStudents.length > 0) {
        const confirmDownload = confirm(`No students selected. Do you want to download all ${filteredStudents.length} filtered students?`);
        if (!confirmDownload) return;
      }
      
      // Don't proceed if there are no students to download
      if (studentsToDownload.length === 0) {
        alert("No students to download. Please select students or apply filters to show students.");
        return;
      }
      
      const response = await fetch("/api/download-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentIds: studentsToDownload,
          visibleColumns: columnVisibility
        }),
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
              {/* Replace the old search components with UnifiedSearch */}
              <UnifiedSearch
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onAISearchResults={handleAISearchResults}
                onApplyQuery={applyQuery}
                onUpdateColumnVisibility={handleColumnVisibilityChange}
                onSQLQueryResults={handleSQLQueryResults}
                initialColumnVisibility={columnVisibility}
              />

              <div className="mt-6">
                <ActionButtons
                  selectedStudentsCount={selectedStudents.length}
                  onAdd={() => setIsCreating(true)}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={() => setSelectedStudents([])}
                  onDownloadSelected={handleDownloadSelected}
                />
              </div>

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
                  <table className="w-full table-fixed border-collapse">
                    <thead className="bg-zinc-800 text-zinc-400 text-left text-sm">
                      <tr>
                        {columnVisibility.select && (
                          <th className="px-2 py-3 w-[50px] align-middle">
                            <Checkbox
                              checked={isSelectAll}
                              onCheckedChange={handleSelectAll}
                              className="border-zinc-400 text-zinc-100 data-[state=checked]:text-zinc-100 data-[state=checked]:bg-zinc-700"
                            />
                          </th>
                        )}
                        {(columnVisibility.firstName || columnVisibility.lastName) && (
                          <th className="px-2 py-3 w-[20%] align-middle">Name</th>
                        )}
                        {columnVisibility.graduationYear && (
                          <th className="px-2 py-3 w-[80px] align-middle">Grad Year</th>
                        )}
                        {columnVisibility.email && (
                          <th className="px-2 py-3 w-[20%] align-middle">Email</th>
                        )}
                        {columnVisibility.phoneNumber && (
                          <th className="px-2 py-3 w-[120px] align-middle">Phone</th>
                        )}
                        {columnVisibility.state && (
                          <th className="px-2 py-3 w-[60px] align-middle">State</th>
                        )}
                        {columnVisibility.schoolOrg && (
                          <th className="px-2 py-3 w-[15%] align-middle">School</th>
                        )}
                        {columnVisibility.promisingStudent && (
                          <th className="px-2 py-3 w-[80px] text-center align-middle">Promising</th>
                        )}
                        {columnVisibility.actions && (
                          <th className="px-2 py-3 w-[100px] text-right align-middle">Actions</th>
                        )}
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
                          columnVisibility={columnVisibility}
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
                          userRole={session?.user?.role}
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