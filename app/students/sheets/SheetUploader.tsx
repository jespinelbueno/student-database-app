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

export function SheetUploader({ onRefresh }: SheetUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<UploadedStudent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processExcelData = (data: any[]): UploadedStudent[] => {
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
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData = processExcelData(jsonData);

        if (processedData.length > 30) {
          setErrorMessage("You can upload a maximum of 30 students at a time.");
          setPreviewData([]);
        } else {
          setErrorMessage(null);
          setPreviewData(processedData);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        setErrorMessage("Failed to process the file. Please try again.");
        setPreviewData([]);
      }
    };

    reader.readAsArrayBuffer(file);
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

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className="border-2 border-dashed p-8 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          <p>Drag and drop a file, or click to select one</p>
        </div>
        {previewData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Preview of Uploaded Data:</h3>
            <ul className="list-disc list-inside">
              {previewData.map((student, index) => (
                <li key={index}>
                  {student.firstName} {student.lastName} - {student.email} -{" "}
                  {student.graduationYear} - {student.phoneNumber} -{" "}
                  {student.schoolOrg} - {student.state}
                </li>
              ))}
            </ul>
            <div className="Buttons flex flex-wrap gap-3">
              {" "}
              <Button
                className="mt-4"
                onClick={handleApproveAndUpload}
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Approve and Upload"}
              </Button>
              <Button className="mt-4" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
      </CardContent>
      <CardFooter>
        You can upload a maximum of 30 students at a time.
      </CardFooter>
    </Card>
  );
}
