"use client";

import React, { useState, useEffect } from "react";
import { Student } from "@/lib/students"; // Ensure you import the Student type
import StudentList from "./students/list/StudentList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SheetUploader } from "./students/sheets/SheetUploader";
import { StudentMainChart } from "./students/chart/StudentMainChart";
import { Users, BarChart2, Upload } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-zinc-800 rounded-lg gap-1">
          <TabsTrigger 
            value="list" 
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Student List</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
          <TabsTrigger 
            value="charts" 
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
          >
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Charts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="import" 
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 py-3 flex gap-2 items-center justify-center"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import with AI</span>
            <span className="sm:hidden">Import</span>
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="list">
            {isLoading ? (
              <p className="text-zinc-400">Loading students...</p>
            ) : (
              <StudentList initialStudents={students} />
            )}
          </TabsContent>
          <TabsContent value="charts">
            <StudentMainChart initialStudents={students} />
          </TabsContent>
          <TabsContent value="import">
            <SheetUploader onRefresh={fetchStudents} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
