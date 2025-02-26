# FutureScholars AI: Student Database Application

Developed an AI-powered student management platform that combines natural language processing, document analysis, and predictive analytics to streamline educational record management and student potential assessment.

Technologies used: Next.js 14, TypeScript, PostgreSQL, Prisma, TensorFlow.js, Natural.js, Tesseract.js, PDF.js, Tailwind CSS, and Shadcn/ui.


## AI-Powered Features

### Natural Language Search
The application incorporates advanced natural language processing capabilities that allow users to search through student records using everyday language. For example:
- "Show me all promising students in California"
- "Find students graduating between 2024 and 2025"
- "List students from New York with high potential"

### Intelligent Query Processing
- **Query Understanding**: The system analyzes natural language inputs and converts them into structured database queries
- **Context Awareness**: Understands educational context and student-specific terminology
- **Smart Filtering**: Automatically identifies relevant search parameters from natural language input

### Document Processing
- **Smart Data Extraction**: AI-powered extraction of student information from uploaded documents
- **Automatic Field Mapping**: Intelligent mapping of extracted data to database fields
- **Validation & Verification**: Automated validation of extracted information with confidence scoring

### Predictive Features
- **Student Potential Analysis**: AI-assisted evaluation of student promising status
- **Data Pattern Recognition**: Identifies trends and patterns in student data
- **Smart Suggestions**: Provides intelligent suggestions for data entry and search refinement

## Features

- **Advanced Student Management**
  - Create, read, update, and delete student records
  - Bulk selection and operations
  - Promising student tracking
  - Comprehensive student information including contact details and academic status

- **Smart Search Capabilities**
  - Natural language search processing
  - Custom SQL query interface
  - Real-time filtering and sorting
  - Advanced search filters

- **Data Export**
  - Export selected students to Excel
  - Customizable column visibility
  - Bulk data operations

- **Email Integration**
  - Bulk email sending capability
  - Email template system
  - Selected student group messaging

- **Modern UI/UX**
  - Responsive design
  - Dark mode interface
  - Tabbed navigation
  - Interactive data tables
  - Real-time updates

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Reusable component system
- **Lucide React** - Icon system
- **React Hook Form** - Form validation and handling

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe ORM
- **Zod** - Schema validation

### AI Technologies
- **TensorFlow.js** - Machine learning and neural network processing
- **Natural** - Natural language processing library for text analysis
- **Tesseract.js** - OCR processing for document analysis
- **PDF.js** - PDF document parsing and text extraction
- **XLSX** - Excel file processing for data import/export
- **Custom NLP Models** - Specialized models for educational context

### Features
- **Natural Language Processing** - AI-powered search capabilities
- **Excel Export** - Spreadsheet generation for data export
- **Email Service** - SMTP integration for email functionality
- **Real-time Validation** - Client and server-side data validation

## Getting Started

1. **Prerequisites**
   - Node.js 18+ installed
   - PostgreSQL database
   - npm or yarn package manager

2. **Environment Setup**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd student-database-app

   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env
   ```

3. **Database Setup**
   ```bash
   # Run database migrations
   npx prisma migrate dev
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/student_db"
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

## Project Structure

```
student-database-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── students/          # Student-related pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
├── lib/                   # Utility functions and shared logic
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
