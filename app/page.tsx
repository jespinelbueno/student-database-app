"use client";

import React, { useState, useEffect } from "react";
import { Student } from "@/lib/students"; // Ensure you import the Student type
import StudentList from "./students/list/StudentList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SheetUploader } from "./students/sheets/SheetUploader";
import { StudentMainChart } from "./students/chart/StudentMainChart";

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]); // Explicitly type the state
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data: Student[] = await response.json(); // Type the API response
      setStudents(data); // This now works since students is explicitly typed
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="container bg-zinc-100 mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Student Management Dashboard</h1>
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Student List</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="import">Import from Sheets</TabsTrigger>

        </TabsList>
        <TabsContent value="list">
          {isLoading ? (
            <p>Loading students...</p>
          ) : (
            <StudentList initialStudents={students} />
          )}
        </TabsContent>
        <TabsContent value="charts">
          <StudentMainChart initialStudents={students}></StudentMainChart>
        </TabsContent>
        <TabsContent value="import">
          <SheetUploader onRefresh={fetchStudents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
