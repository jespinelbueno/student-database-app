"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DocumentAnalysis } from "@/lib/students";

interface SheetUploaderProps {
  onRefresh?: () => void;
}

interface UploadedStudent {
  firstName: string;
  lastName: string;
  email: string;
  graduationYear: number;
  phoneNumber?: string | null;
  promisingStudent?: boolean;
  schoolOrg?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface ExcelRow {
  "First Name": string;
  "Last Name": string;
  "Email": string;
  "Graduation Year": string | number;
  "Phone Number"?: string;
  "Promising Student"?: string | boolean;
  "School Org"?: string;
  "Address"?: string;
  "City"?: string;
  "State"?: string;
  "Zip Code"?: string;
}

export function SheetUploader({ onRefresh }: SheetUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<UploadedStudent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<DocumentAnalysis | null>(null);

  const processFileWithAI = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file with AI');
      }

      const analysis: DocumentAnalysis = await response.json();
      setAiAnalysis(analysis);

      // If AI processing is successful and confidence is high, add to preview
      if (analysis.confidence > 0.8 && analysis.extractedData) {
        setPreviewData(prev => [...prev, analysis.extractedData]);
      }
    } catch (error) {
      console.error('Error processing file with AI:', error);
      setErrorMessage('AI processing failed. Falling back to standard processing.');
    }
  };

  const processExcelData = (data: ExcelRow[]): UploadedStudent[] => {
    const columnMap: { [key: string]: keyof UploadedStudent } = {
      "First Name": "firstName",
      "Last Name": "lastName",
      Email: "email",
      "Graduation Year": "graduationYear",
      "Phone Number": "phoneNumber",
      "Promising Student": "promisingStudent",
      "School Org": "schoolOrg",
      Address: "address",
      City: "city",
      State: "state",
      "Zip Code": "zipCode",
    };
  
    const students: UploadedStudent[] = data.map((row) => {
      const student: Partial<UploadedStudent> = {};
      Object.entries(row).forEach(([key, value]) => {
        const mappedKey = columnMap[key];
        if (mappedKey) {
          if (mappedKey === "graduationYear") {
            student[mappedKey] = isNaN(Number(value))
              ? undefined
              : Number(value);
          } else if (mappedKey === "promisingStudent") {
            student[mappedKey] = value === "true" || value === true;
          } else {
            student[mappedKey] =
              typeof value === "string"
                ? value
                : value?.toString() || undefined;
          }
        }
      });
      return student as UploadedStudent;
    });
  
    // Check for duplicates based on email
    const seen = new Set<string>();
    const duplicates: UploadedStudent[] = [];
    const uniqueStudents: UploadedStudent[] = [];
  
    students.forEach((student) => {
      if (seen.has(student.email)) {
        duplicates.push(student);
      } else {
        seen.add(student.email);
        uniqueStudents.push(student);
      }
    });
  
    if (duplicates.length > 0) {
      setErrorMessage(
        `Duplicate students detected. Please remove duplicates before proceeding. Duplicates: ${duplicates
          .map((d) => `${d.firstName} ${d.lastName} (${d.email})`)
          .join(", ")}`
      );
      return [];
    }
  
    return uniqueStudents;
  };
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAiAnalysis(null);

    for (const file of acceptedFiles) {
      if (file.type.includes('pdf') || file.type.includes('image')) {
        await processFileWithAI(file);
      } else {
        // Process Excel files as before
        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const processedData = processExcelData(jsonData as ExcelRow[]);

            if (processedData.length > 30) {
              setErrorMessage("You can upload a maximum of 30 students at a time.");
              setPreviewData([]);
            } else {
              setErrorMessage(null);
              setPreviewData(prev => [...prev, ...processedData]);
            }
          } catch (error) {
            console.error("Error reading file:", error);
            setErrorMessage("Failed to process the file. Please try again.");
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }
    setIsLoading(false);
  }, []);

  const handleApproveAndUpload = async () => {
    setIsLoading(true);
    try {
      // Fetch existing emails from the database
      const existingEmailsResponse = await fetch("/api/emails");
      if (!existingEmailsResponse.ok) {
        throw new Error("Failed to fetch existing student emails");
      }
      
      const existingEmails: string[] = await existingEmailsResponse.json();

      // Normalize email case for comparison
      const normalizedExistingEmails = existingEmails.map(email => email.toLowerCase());
      const uploadedEmails = previewData.map(student => student.email.toLowerCase());

      // Find duplicates
      const duplicates = uploadedEmails.filter(email => 
        normalizedExistingEmails.includes(email)
      );

      if (duplicates.length > 0) {
        setErrorMessage(
          `These students already exist in the database: ${duplicates.join(", ")}`
        );
        setIsLoading(false);
        return;
      }

      // Proceed with upload if no duplicates
      const response = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });

      if (!response.ok) {
        throw new Error("Failed to upload students");
      }

      alert("Students submitted successfully!");
      setPreviewData([]);

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error uploading students:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload students. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancel = () => {
    setIsLoading(false);
    setPreviewData([]); // Clear preview data
    setErrorMessage(null); // Clear any error messages
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
  });

  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-zinc-100">Upload Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors p-8 text-center cursor-pointer rounded-lg"
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-zinc-400">Processing files...</p>
            </div>
          ) : (
            <p className="text-zinc-400">
              Drag and drop files, or click to select (Supports PDF, Images, Excel)
            </p>
          )}
        </div>

        {aiAnalysis && (
          <div className="mt-6 bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">AI Analysis Results:</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400">Confidence Score:</span>
              <span className={`font-mono ${aiAnalysis.confidence > 0.8 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                {Math.round(aiAnalysis.confidence * 100)}%
              </span>
            </div>
            {aiAnalysis.missingFields.length > 0 && (
              <div className="mb-2">
                <span className="text-red-400">Missing Fields:</span>
                <ul className="list-disc list-inside text-zinc-400">
                  {aiAnalysis.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiAnalysis.suggestedActions.length > 0 && (
              <div>
                <span className="text-emerald-400">Suggested Actions:</span>
                <ul className="list-disc list-inside text-zinc-400">
                  {aiAnalysis.suggestedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {previewData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Preview of Uploaded Data:</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-300">
              {previewData.map((student, index) => (
                <li key={index} className="text-sm">
                  {student.firstName} {student.lastName} - {student.email} -{" "}
                  {student.graduationYear} - {student.phoneNumber} -{" "}
                  {student.schoolOrg} - {student.state}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                onClick={handleApproveAndUpload}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? "Uploading..." : "Approve and Upload"}
              </Button>
              <Button 
                onClick={handleCancel}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {errorMessage && (
          <p className="mt-4 text-red-400 bg-red-900/20 p-3 rounded-lg">{errorMessage}</p>
        )}
      </CardContent>
      <CardFooter className="text-zinc-400 text-sm">
        You can upload a maximum of 30 students at a time.
      </CardFooter>
    </Card>
  );
}
