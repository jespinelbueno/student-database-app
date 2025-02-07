// StudentList.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Student,
  CreateStudentInput,
  UpdateStudentInput
} from "@/lib/students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import modular components
import { SearchBar } from "@/components/SearchBar";
import { ActionButtons } from "@/components/ActionButtons";
import { StudentForm } from "@/components/StudentForm";
import { StudentTable } from "@/components/StudentTable";
import { PaginationControls } from "@/components/PaginationControls";
import QueryWizard from "@/components/queryWizard/QueryWizard";
import { NaturalLanguageSearch } from '@/components/NaturalLanguageSearch'

// Import the custom hook
import { useStudents } from "@/hooks/useStudents";

// Remove unused import if not needed
// import { QueryCondition } from '@/types/interfaces'

const STUDENTS_PER_PAGE = 5;

interface StudentListProps {
  initialStudents: Student[];
}

export default function StudentList({ initialStudents }: StudentListProps) {
  // Use the custom hook
  const {
    filteredStudents,
    searchTerm,
    isLoading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    applyQuery,
    handleSearch,
  } = useStudents(initialStudents);

  // Local UI state
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
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

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  // Handle form input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      await updateStudent(id, data);
      setIsEditing(null);
      alert("Student updated successfully");
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student. Please try again.");
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

  // Handle selecting a student
  const handleSelectStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  // Handle selecting all students on the current page
  const handleSelectAll = () => {
    const currentPageIds = paginatedStudents.map((student) => student.id);
    setSelectedStudents((prev) => {
      const newSelection = [...prev];
      currentPageIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Handle deselecting all students on the current page
  const handleDeselectAll = () => {
    const currentPageIds = paginatedStudents.map((student) => student.id);
    setSelectedStudents((prev) =>
      prev.filter((id) => !currentPageIds.includes(id))
    );
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
      window.URL.revokeObjectURL(url);
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

  // Return JSX

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
        {/* AI Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NaturalLanguageSearch 
            onSearchResults={(results) => {
              // Update the filtered students with the search results
              handleSearch(""); // Clear the current search
              // Apply each filter from the NL search results
              applyQuery(results.filters.map(filter => ({
                field: filter.field,
                operator: filter.operation,
                value: filter.value
              })));
              setCurrentPage(1); // Reset to first page
            }} 
          />

        </div>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Action Buttons */}
        <ActionButtons
          selectedStudentsCount={selectedStudents.length}
          onAdd={() => setIsCreating(true)}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onDownloadSelected={handleDownloadSelected}
          showQueryWizard={showQueryWizard}
          toggleQueryWizard={() => setShowQueryWizard(!showQueryWizard)}
        />

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
              onChange={handleInputChange}
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
              isEditing={false}
            />
          </div>
        )}

        {/* Student Table */}
        <div className="mt-4">
          <StudentTable
            students={paginatedStudents}
            selectedStudents={selectedStudents}
            onSelectStudent={handleSelectStudent}
            isEditing={isEditing}
            onEdit={handleEditStudent}
            onDelete={handleDelete}
            formData={formData}
            setFormData={setFormData}
            handleUpdate={handleUpdate}
            setIsEditing={setIsEditing}
            handleInputChange={handleInputChange}
          />
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
      </CardContent>
    </Card>
  );
}
