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
    <div className="container bg-zinc-900 mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-zinc-100 tracking-tight">Future Scholars Dashboard</h1>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="bg-zinc-800 p-1">
          <TabsTrigger value="list" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">Student List</TabsTrigger>
          <TabsTrigger value="charts" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">Charts</TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100">Import from Sheets</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          {isLoading ? (
            <p className="text-zinc-400">Loading students...</p>
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
