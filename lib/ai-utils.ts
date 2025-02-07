import { createWorker } from 'tesseract.js';
import * as natural from 'natural';
import { StudentData, QueryFilter } from './students';
import lunr from 'lunr';

const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Enhanced training data for the classifier
// Regular student queries
classifier.addDocument('show all students', 'student');
classifier.addDocument('find students', 'student');
classifier.addDocument('search students', 'student');
classifier.addDocument('list students', 'student');
classifier.addDocument('display students', 'student');
classifier.addDocument('show me students', 'student');

// Name-based queries
classifier.addDocument('named', 'name');
classifier.addDocument('with name', 'name');
classifier.addDocument('whose name is', 'name');
classifier.addDocument('called', 'name');
classifier.addDocument('first name', 'firstName');
classifier.addDocument('last name', 'lastName');
classifier.addDocument('show me students named', 'name');
classifier.addDocument('find students named', 'name');
classifier.addDocument('students named', 'name');
classifier.addDocument('name contains', 'name');
classifier.addDocument('students with first name', 'firstName');
classifier.addDocument('students with last name', 'lastName');
classifier.addDocument('show students with name', 'name');
classifier.addDocument('find students with name', 'name');
classifier.addDocument('search for name', 'name');
classifier.addDocument('search by name', 'name');

// Promising student queries
classifier.addDocument('show promising students', 'promisingStudent');
classifier.addDocument('find promising students', 'promisingStudent');
classifier.addDocument('promising', 'promisingStudent');
classifier.addDocument('high achieving', 'promisingStudent');
classifier.addDocument('honors students', 'promisingStudent');
classifier.addDocument('dean\'s list', 'promisingStudent');
classifier.addDocument('excellent academic', 'promisingStudent');

// Graduation year queries
classifier.addDocument('graduating in', 'graduationYear');
classifier.addDocument('graduates in', 'graduationYear');
classifier.addDocument('class of', 'graduationYear');
classifier.addDocument('expected graduation', 'graduationYear');
classifier.addDocument('graduation year', 'graduationYear');
classifier.addDocument('graduate in', 'graduationYear');
classifier.addDocument('finish in', 'graduationYear');

// Location queries
classifier.addDocument('from state', 'state');
classifier.addDocument('in state', 'state');
classifier.addDocument('living in', 'state');
classifier.addDocument('located in', 'state');
classifier.addDocument('based in', 'state');
classifier.addDocument('resident of', 'state');
classifier.addDocument('who live in', 'state');
classifier.addDocument('students in', 'state');

// School queries
classifier.addDocument('from school', 'schoolOrg');
classifier.addDocument('attending', 'schoolOrg');
classifier.addDocument('enrolled at', 'schoolOrg');
classifier.addDocument('studying at', 'schoolOrg');
classifier.addDocument('student at', 'schoolOrg');
classifier.addDocument('goes to', 'schoolOrg');
classifier.addDocument('who attend', 'schoolOrg');
classifier.addDocument('students from', 'schoolOrg');

// Contact queries
classifier.addDocument('phone number', 'phoneNumber');
classifier.addDocument('contact', 'phoneNumber');
classifier.addDocument('call at', 'phoneNumber');
classifier.addDocument('phone', 'phoneNumber');

classifier.addDocument('email', 'email');
classifier.addDocument('contact at', 'email');
classifier.addDocument('reach at', 'email');
classifier.addDocument('email address', 'email');

classifier.train();

// Initialize Tesseract worker
let worker: Tesseract.Worker | null = null;

export async function initializeOCR() {
  if (!worker) {
    worker = await createWorker('eng');
  }
  return worker;
}

export async function processDocument(file: File): Promise<StudentData> {
  const text = await extractTextFromDocument(file);
  return extractStudentData(text);
}

async function extractTextFromDocument(file: File): Promise<string> {
  const worker = await initializeOCR();
  const result = await worker.recognize(file);
  return result.data.text;
}

function extractStudentData(text: string): StudentData {
  const data: Partial<StudentData> = {};
  
  // Extract email using enhanced regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    data.email = emailMatch[0];
  }

  // Extract phone number with various formats
  const phoneRegex = /(?:\+?1[-.]?)?\b\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    data.phoneNumber = `${phoneMatch[1]}-${phoneMatch[2]}-${phoneMatch[3]}`;
  }

  // Extract names with more patterns
  const namePatterns = [
    // Full name pattern (First Last)
    /([A-Z][a-z]+)\s+([A-Z][a-z]+)/,
    // Name with middle initial
    /([A-Z][a-z]+)\s+[A-Z]\.\s+([A-Z][a-z]+)/,
    // Name with prefix (Mr./Ms./Dr.)
    /(?:Mr\.|Ms\.|Dr\.)\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)/,
    // Name in format "Last, First"
    /([A-Z][a-z]+),\s+([A-Z][a-z]+)/,
  ];

  for (const pattern of namePatterns) {
    const nameMatch = text.match(pattern);
    if (nameMatch) {
      // If it's "Last, First" format, swap the groups
      if (pattern.toString().includes(',')) {
        data.firstName = nameMatch[2];
        data.lastName = nameMatch[1];
      } else {
        data.firstName = nameMatch[1];
        data.lastName = nameMatch[2];
      }
      break;
    }
  }

  // Extract graduation year with context
  const yearPatterns = [
    /(?:Class of|Graduating|Graduate|Graduation Year:?)\s*(20\d{2})/i,
    /20\d{2}\s*(?:Graduate|Expected|Graduation)/i,
    /\b20\d{2}\b/,
  ];

  for (const pattern of yearPatterns) {
    const yearMatch = text.match(pattern);
    if (yearMatch) {
      const year = parseInt(yearMatch[1] || yearMatch[0]);
      if (year >= new Date().getFullYear()) {
        data.graduationYear = year;
        break;
      }
    }
  }

  // Extract state with full name or abbreviation
  const stateMap = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY'
  };

  // Try to find state by full name first
  const stateFullNamePattern = new RegExp(`\\b(${Object.keys(stateMap).join('|')})\\b`, 'i');
  const stateFullMatch = text.match(stateFullNamePattern);
  if (stateFullMatch) {
    data.state = stateMap[stateFullMatch[1] as keyof typeof stateMap];
  } else {
    // Try abbreviation
    const stateAbbrevPattern = /\b([A-Z]{2})\b/;
    const stateAbbrevMatch = text.match(stateAbbrevPattern);
    if (stateAbbrevMatch && Object.values(stateMap).includes(stateAbbrevMatch[1])) {
      data.state = stateAbbrevMatch[1];
    }
  }

  // Extract school/organization with common patterns
  const schoolPatterns = [
    /(?:School|University|College|Institute|Academy):\s*([^\\n.]+)/i,
    /(?:Attending|Enrolled at)\s+([^\\n.]+)/i,
    /([^\\n.]+)(?:University|College|School|Institute|Academy)\b/,
  ];

  for (const pattern of schoolPatterns) {
    const schoolMatch = text.match(pattern);
    if (schoolMatch) {
      data.schoolOrg = schoolMatch[1].trim();
      break;
    }
  }

  // Extract promising student indicators
  const promisingIndicators = [
    /honor(?:s|\s+roll)/i,
    /dean'?s\s+list/i,
    /high\s+achieve(?:r|ment)/i,
    /excellent\s+academic/i,
    /outstanding\s+student/i,
    /\b[4]\.[0-9]?\s*GPA\b/,
    /\b[3]\.[7-9][0-9]?\s*GPA\b/,
  ];

  data.promisingStudent = promisingIndicators.some(pattern => pattern.test(text));

  return {
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    graduationYear: data.graduationYear || new Date().getFullYear(),
    phoneNumber: data.phoneNumber,
    promisingStudent: data.promisingStudent || false,
    schoolOrg: data.schoolOrg || '',
    state: data.state,
  };
}

export function processNaturalLanguageQuery(query: string) {
  const tokens = tokenizer.tokenize(query.toLowerCase());
  const classifications = tokens.map(token => classifier.classify(token));
  
  const filters: QueryFilter[] = [];
  
  // Enhanced name-based queries processing
  const namePatterns = [
    /(?:named|called)\s+([A-Za-z]+)/i,
    /name\s+is\s+([A-Za-z]+)/i,
    /first\s+name\s+(?:is\s+)?([A-Za-z]+)/i,
    /last\s+name\s+(?:is\s+)?([A-Za-z]+)/i,
    /students?\s+named\s+([A-Za-z]+)/i,
    /name\s+contains?\s+([A-Za-z]+)/i,
    /with\s+(?:the\s+)?name\s+([A-Za-z]+)/i,
    /show\s+(?:me\s+)?students?\s+(?:with|named)\s+([A-Za-z]+)/i,
    /find\s+students?\s+(?:with|named)\s+([A-Za-z]+)/i,
  ];

  if (classifications.includes('name') || classifications.includes('firstName') || classifications.includes('lastName')) {
    for (const pattern of namePatterns) {
      const nameMatch = query.match(pattern);
      if (nameMatch) {
        const name = nameMatch[1];
        if (query.toLowerCase().includes('first name')) {
          filters.push({
            field: 'firstName',
            operation: 'contains',
            value: name,
            confidence: 0.9,
          });
        } else if (query.toLowerCase().includes('last name')) {
          filters.push({
            field: 'lastName',
            operation: 'contains',
            value: name,
            confidence: 0.9,
          });
        } else {
          // If not specified, search in both first and last name
          filters.push({
            field: 'firstName',
            operation: 'contains',
            value: name,
            confidence: 0.85,
          });
          filters.push({
            field: 'lastName',
            operation: 'contains',
            value: name,
            confidence: 0.85,
          });
        }
        break;
      }
    }
  }
  
  // Process graduation year with enhanced patterns
  const yearPatterns = [
    /(?:class of|graduating|graduate|year|in)\s*(20\d{2})/i,
    /20\d{2}\s*(?:graduate|expected|graduation)/i,
    /\b20\d{2}\b/,
  ];

  for (const pattern of yearPatterns) {
    const yearMatch = query.match(pattern);
    if (yearMatch && classifications.includes('graduationYear')) {
      const year = parseInt(yearMatch[1] || yearMatch[0]);
      if (year >= new Date().getFullYear()) {
        filters.push({
          field: 'graduationYear',
          operation: 'equals',
          value: year,
          confidence: 0.9,
        });
        break;
      }
    }
  }

  // Process promising student with enhanced detection
  const promisingPatterns = [
    /promising/i,
    /high[\s-]achieving/i,
    /honors/i,
    /dean'?s\s+list/i,
    /excellent\s+academic/i,
  ];

  if (classifications.includes('promisingStudent') || 
      promisingPatterns.some(pattern => pattern.test(query))) {
    filters.push({
      field: 'promisingStudent',
      operation: 'equals',
      value: true,
      confidence: 0.85,
    });
  }

  // Process state with enhanced detection
  const stateMap = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY'
  };

  if (classifications.includes('state')) {
    // Try full state name
    const statePattern = new RegExp(`\\b(${Object.keys(stateMap).join('|')})\\b`, 'i');
    const stateMatch = query.match(statePattern);
    if (stateMatch) {
      filters.push({
        field: 'state',
        operation: 'equals',
        value: stateMap[stateMatch[1] as keyof typeof stateMap],
        confidence: 0.9,
      });
    } else {
      // Try state abbreviation
      const stateAbbrevPattern = /\b([A-Z]{2})\b/;
      const stateAbbrevMatch = query.match(stateAbbrevPattern);
      if (stateAbbrevMatch && Object.values(stateMap).includes(stateAbbrevMatch[1])) {
        filters.push({
          field: 'state',
          operation: 'equals',
          value: stateAbbrevMatch[1],
          confidence: 0.9,
        });
      }
    }
  }

  // Process school with enhanced patterns
  const schoolPatterns = [
    /(?:from|at|attending|enrolled\s+at)\s+([A-Za-z\s&]+?)(?:\s+in\s+|$)/i,
    /([A-Za-z\s&]+?)(?:\s+University|\s+College|\s+School|\s+Institute|\s+Academy)/i,
  ];

  if (classifications.includes('schoolOrg')) {
    for (const pattern of schoolPatterns) {
      const schoolMatch = query.match(pattern);
      if (schoolMatch) {
        filters.push({
          field: 'schoolOrg',
          operation: 'contains',
          value: schoolMatch[1].trim(),
          confidence: 0.85,
        });
        break;
      }
    }
  }

  // Update the interpretations to include name searches
  const interpretations = [];
  if (filters.find(f => f.field === 'firstName' || f.field === 'lastName')) {
    const nameValue = filters.find(f => f.field === 'firstName' || f.field === 'lastName')?.value;
    interpretations.push(`with name containing "${nameValue}"`);
  }
  if (filters.find(f => f.field === 'promisingStudent')) {
    interpretations.push('promising students');
  }
  if (filters.find(f => f.field === 'graduationYear')) {
    interpretations.push(`graduating in ${filters.find(f => f.field === 'graduationYear')?.value}`);
  }
  if (filters.find(f => f.field === 'state')) {
    interpretations.push(`from ${filters.find(f => f.field === 'state')?.value}`);
  }
  if (filters.find(f => f.field === 'schoolOrg')) {
    interpretations.push(`at ${filters.find(f => f.field === 'schoolOrg')?.value}`);
  }

  const queryInterpretation = interpretations.length > 0
    ? `Finding ${interpretations.join(', ')}`
    : `Processing query: ${query}`;

  return {
    queryInterpretation,
    filters,
    confidence: filters.length > 0 ? 0.8 + (filters.length * 0.05) : 0.7,
  };
}

// Create search index for full-text search
export function createSearchIndex(students: StudentData[]) {
  return lunr(function(this: lunr.Builder) {
    this.field('firstName');
    this.field('lastName');
    this.field('email');
    this.field('schoolOrg');
    this.field('state');
    
    students.forEach((student, index) => {
      this.add({
        id: index.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        schoolOrg: student.schoolOrg,
        state: student.state || '',
      });
    });
  });
} 