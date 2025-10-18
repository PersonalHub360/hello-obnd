# AuroraMY Staff Management System

## Overview

AuroraMY is a professional staff management system designed to efficiently manage employee data, departments, and team member information. The application provides a clean, modern interface for viewing, searching, and managing staff records with a focus on data clarity and professional presentation.

The system is built as a full-stack web application with a React-based frontend and Express backend, using session-based authentication and an in-memory data storage system (with PostgreSQL schema defined for future database integration).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component System:**
- shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design system follows Material Design principles with modern SaaS aesthetics (Linear/Notion-inspired)
- Comprehensive component library including tables, forms, dialogs, dropdowns, and more

**State Management:**
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod validation for form handling
- Local React state for UI interactions

**Design System:**
- Custom color palette supporting light and dark modes
- Inter font family for primary typography, JetBrains Mono for monospace
- Consistent spacing and border radius system
- Professional blue primary color (HSL: 221 83% 53%) for trust and corporate feel

**Rationale:** The frontend prioritizes developer experience with TypeScript and modern React patterns while maintaining a professional, accessible UI through the shadcn/ui system. The design focuses on clarity over decoration, making it ideal for data-heavy staff management interfaces.

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server
- TypeScript for type-safe server code
- ESM module system for modern JavaScript practices

**Authentication & Sessions:**
- Express-session middleware for session management
- Session-based authentication (no JWT tokens)
- Cookie-based session storage with configurable security options
- Session secret configurable via environment variable (SESSION_SECRET)
- 24-hour session lifetime by default

**Data Layer:**
- In-memory storage implementation (MemStorage class) for development
- IStorage interface defines the contract for data operations
- Seeded with sample staff and admin user data for immediate testing
- PostgreSQL schema defined using Drizzle ORM for production database integration

**API Structure:**
- RESTful API endpoints under `/api` prefix
- Auth endpoints: `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`
- Staff endpoints: `/api/staff` (CRUD operations)
- Consistent error handling middleware
- Request/response logging for API calls

**Rationale:** The backend is designed with a clear separation between the storage interface and implementation, allowing easy transition from in-memory storage to PostgreSQL without changing API logic. Session-based auth provides security without the complexity of token management.

### Data Storage Solutions

**Current Implementation:**
- In-memory Map-based storage for development and testing
- Pre-seeded with admin user (james.bond@auroramy.com / Sp123456@)
- Sample staff data included for immediate functionality

**Production Database Schema (Drizzle ORM):**

**Staff Table:**
- Primary key: UUID (auto-generated)
- Fields: firstName, lastName, email (unique), role, department, phone, status, avatar
- joinDate timestamp with default to current time
- Email uniqueness constraint for data integrity

**Auth Users Table:**
- Primary key: UUID (auto-generated)  
- Fields: email (unique), password, name
- Stores authentication credentials separately from staff records

**Migration System:**
- Drizzle Kit configured for PostgreSQL migrations
- Migration files stored in `/migrations` directory
- Schema defined in `shared/schema.ts` for code sharing between client and server

**Rationale:** The dual-storage approach allows rapid development with in-memory data while maintaining a production-ready database schema. Drizzle ORM provides type-safe database operations and automatic TypeScript type generation from the schema.

### External Dependencies

**UI & Styling:**
- Radix UI (@radix-ui/*) - Unstyled, accessible component primitives
- Tailwind CSS with PostCSS - Utility-first CSS framework
- class-variance-authority - Type-safe component variants
- clsx & tailwind-merge - Utility for merging CSS classes

**Data Fetching & Forms:**
- @tanstack/react-query - Server state management
- react-hook-form - Performant form handling
- @hookform/resolvers - Form validation integration
- zod - TypeScript-first schema validation
- drizzle-zod - Zod schema generation from Drizzle schemas

**Database & ORM:**
- Drizzle ORM - TypeScript ORM for SQL databases
- @neondatabase/serverless - Neon PostgreSQL serverless driver
- connect-pg-simple - PostgreSQL session store (for production sessions)

**Development Tools:**
- tsx - TypeScript execution for Node.js
- esbuild - Fast JavaScript bundler for production builds
- Vite plugins: @replit/vite-plugin-runtime-error-modal, cartographer, dev-banner

**Utility Libraries:**
- date-fns - Modern date utility library
- nanoid - Unique ID generator
- cmdk - Command palette component
- embla-carousel-react - Carousel/slider component

**Google Fonts:**
- Inter - Primary font family for clean, professional text
- JetBrains Mono - Monospace font for technical content (emails, IDs)

**Environment Configuration:**
- DATABASE_URL - PostgreSQL connection string (required for database operations)
- SESSION_SECRET - Secret key for session encryption (defaults to development key)
- NODE_ENV - Environment mode (development/production)

**Rationale:** Dependencies are carefully selected to provide production-grade functionality while maintaining simplicity. The combination of Radix UI and Tailwind enables rapid UI development with accessibility built-in. Drizzle ORM offers excellent TypeScript integration while remaining lightweight compared to heavier ORMs.