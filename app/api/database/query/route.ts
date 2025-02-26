import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// List of allowed query prefixes for security
const ALLOWED_QUERY_PREFIXES = ['SELECT', 'WITH'];

// List of disallowed query terms for security
const DISALLOWED_QUERY_TERMS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 
  'TRUNCATE', 'GRANT', 'REVOKE', 'EXECUTE'
];

// Map table and column names
const COLUMN_MAPPINGS = {
  // SQL name to Prisma name (snake_case to camelCase)
  'first_name': 'firstName',
  'last_name': 'lastName',
  'graduation_year': 'graduationYear',
  'phone_number': 'phoneNumber',
  'promising_student': 'promisingStudent',
  'school_org': 'schoolOrg',
  'zip_code': 'zipCode',
  'created_at': 'createdAt',
  'updated_at': 'updatedAt',
  // Also map camelCase to Prisma names for convenience
  'firstName': 'firstName',
  'lastName': 'lastName',
  'graduationYear': 'graduationYear',
  'phoneNumber': 'phoneNumber',
  'promisingStudent': 'promisingStudent',
  'schoolOrg': 'schoolOrg',
  'zipCode': 'zipCode',
  'createdAt': 'createdAt',
  'updatedAt': 'updatedAt'
};

// Reverse mapping for results (camelCase to snake_case) 
const REVERSE_COLUMN_MAPPINGS = {
  'firstName': 'first_name',
  'lastName': 'last_name',
  'graduationYear': 'graduation_year',
  'phoneNumber': 'phone_number',
  'promisingStudent': 'promising_student',
  'schoolOrg': 'school_org',
  'zipCode': 'zip_code',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at'
};

// Function to transform column names in the entire query
function transformQuery(query: string): string {
  // Replace table names first - looking at the error, we need to use "Student" with capital S
  // The table in Prisma is likely named "Student" not "student"
  let transformedQuery = query.replace(/\b(students|student)\b/gi, '"Student"');
  
  // Create a regex pattern that captures all column names
  const columnNames = Object.keys(COLUMN_MAPPINGS);
  const columnPattern = new RegExp(`\\b(${columnNames.join('|')})\\b`, 'gi');
  
  // Replace column names with their Prisma equivalents
  transformedQuery = transformedQuery.replace(columnPattern, (match) => {
    // Case-insensitive lookup
    const lowerMatch = match.toLowerCase();
    for (const key of columnNames) {
      if (key.toLowerCase() === lowerMatch) {
        // Add quotes around column names to prevent SQL errors with case
        return `"${COLUMN_MAPPINGS[key as keyof typeof COLUMN_MAPPINGS]}"`;
      }
    }
    return `"${match}"`; // Keep original if no mapping found, but add quotes
  });
  
  return transformedQuery;
}

// Helper function to handle BigInt serialization
function serializeValue(value: any): any {
  // Convert BigInt to Number for JSON serialization
  if (typeof value === 'bigint') {
    return Number(value);
  }
  
  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // Handle nested objects recursively
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(serializeValue);
    } else {
      const serialized: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        serialized[k] = serializeValue(v);
      }
      return serialized;
    }
  }
  
  return value;
}

// Function to transform result object keys back to the requested format
function transformResults(results: any[]): any[] {
  // If we have no results, return empty array
  if (!results.length) return [];
  
  // Map camelCase field names back to snake_case
  return results.map(row => {
    const transformedRow: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(row)) {
      // First handle serialization of the value to ensure it can be converted to JSON
      const serializedValue = serializeValue(value);
      
      // If there's a reverse mapping, use it; otherwise keep the original key
      const transformedKey = REVERSE_COLUMN_MAPPINGS[key as keyof typeof REVERSE_COLUMN_MAPPINGS] || key;
      
      // Also include the camelCase version for convenience/backward compatibility
      transformedRow[key] = serializedValue; 
      
      // Add the snake_case version if it's different
      if (transformedKey !== key) {
        transformedRow[transformedKey] = serializedValue;
      }
    }
    
    return transformedRow;
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body || !body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected { query: string }' },
        { status: 400 }
      );
    }

    const { query } = body;

    // Normalize query for security checks
    const normalizedQuery = query.trim().toUpperCase();
    
    // Security checks
    if (!ALLOWED_QUERY_PREFIXES.some(prefix => normalizedQuery.startsWith(prefix))) {
      return NextResponse.json(
        { error: 'Query not allowed. Only SELECT queries are permitted.' },
        { status: 400 }
      );
    }
    
    if (DISALLOWED_QUERY_TERMS.some(term => normalizedQuery.includes(term))) {
      return NextResponse.json(
        { error: 'Query contains disallowed operations.' },
        { status: 400 }
      );
    }

    // Transform the query with proper column name handling
    const transformedQuery = transformQuery(query);

    console.log('Original query:', query);
    console.log('Transformed query:', transformedQuery);

    // Execute the query directly
    const result = await prisma.$queryRawUnsafe(transformedQuery);

    // Handle null or undefined result
    if (!result) {
      console.log('Query returned null or undefined');
      return NextResponse.json({ result: [] });
    }

    // Ensure result is an array
    const resultArray = Array.isArray(result) ? result : [result];
    
    // Transform the result keys to include both snake_case and camelCase versions
    const transformedResults = transformResults(resultArray);

    console.log('Query result count:', transformedResults.length); 
    if (transformedResults.length > 0) {
      console.log('First result sample:', transformedResults[0]);
    }
    
    // Return results with transformed keys
    return NextResponse.json({ result: transformedResults });

  } catch (error: any) {
    // Safe error logging
    console.error('Database query error:', error ? error.message : 'Unknown error');
    
    // Create a safe error response
    const errorMessage = error && typeof error.message === 'string' 
      ? error.message 
      : 'An error occurred while executing the query';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 